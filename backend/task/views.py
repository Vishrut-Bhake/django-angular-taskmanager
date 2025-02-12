from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status, generics, filters
from rest_framework.response import Response
from rest_framework.pagination import CursorPagination
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, FileResponse
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import Q
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from .models import Task
from .serializers import TaskSerializer
from datetime import datetime



# Custom Pagination
class TaskPagination(CursorPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 30
    # Sorting by ID
    ordering = ('id')

# Custom Task Status Filter
class TaskStatusFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    "Custom filter to handle multiple task_status values."
    pass


# Task Filtering
class TaskFilter(django_filters.FilterSet):
    from_date = django_filters.DateFilter(field_name="created_at", lookup_expr='gte', label="From Date")
    to_date = django_filters.DateFilter(field_name="created_at", lookup_expr='lte', label="To Date")
    task_status = TaskStatusFilter(field_name="task_status", lookup_expr="in")
    searchQuery = django_filters.CharFilter(method='filter_by_search', label="Search")

    def filter_by_search(self, queryset, name, value):
        """Optimized search filter for task name & description."""
        value = value.strip().lower() if value else None
        return queryset.filter(Q(task_name__icontains=value) | Q(task_description__icontains=value)) if value else queryset

    class Meta:
        model = Task
        fields = ['searchQuery', 'task_name', 'task_description', 'task_status', 'from_date', 'to_date']


# Task Status List API
class TaskStatusListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            statuses = [{"value": status[0], "label": status[1]} for status in Task.STATUS_CHOICES]
            return Response(statuses, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# List & Create Tasks with Pagination
class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.select_related().all().order_by('-created_at', '-id')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TaskPagination
    parser_classes = (MultiPartParser, FormParser)
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    def perform_create(self, serializer):
        """Save task with an optional uploaded file."""
        try:
            serializer.save(task_file=self.request.FILES.get('task_file'))
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})


# Retrieve, Update, and Delete a Task
@method_decorator(csrf_exempt, name='dispatch')
class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, task_id):
        try:
            task = get_object_or_404(Task, id=task_id)
            return JsonResponse(TaskSerializer(task).data, safe=False, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, task_id):
        try:
            task = get_object_or_404(Task, id=task_id)
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, task_id):
        try:
            task = get_object_or_404(Task, id=task_id)
            task.delete()
            return JsonResponse({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Generate and Download Task Report as PDF
def generate_pdf(request):
    """Generate a PDF report based on task filters."""
    try:
        filters = Q()
        
        # Retrieve query parameters
        task_name = request.GET.get('task_name', '').strip()
        search_query = request.GET.get('searchQuery', '').strip()
        task_status = request.GET.get('task_status', '').strip()
        from_date = request.GET.get('from_date', '').strip()
        to_date = request.GET.get('to_date', '').strip()

        # Ensure task_status is correctly processed as a list
        task_status_list = task_status.split(',') if task_status else []

        # Apply filters
        if task_name:
            filters &= Q(task_name__icontains=task_name)
        if search_query:
            filters &= Q(task_name__icontains=search_query) | Q(task_description__icontains=search_query)
        if task_status_list:
            filters &= Q(task_status__in=task_status_list)

        # Validate and apply date filters
        try:
            if from_date and to_date:
                from_date_parsed = datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date_parsed = datetime.strptime(to_date, "%Y-%m-%d").date()
                filters &= Q(created_at__date__range=[from_date_parsed, to_date_parsed])
        except ValueError:
            return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch filtered tasks
        tasks = Task.objects.filter(filters)

        if not tasks.exists():
            return JsonResponse({"error": "No tasks match the selected filters."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate PDF
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        pdf.setTitle("Task Report")
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(100, 750, "Filtered Task Report")
        pdf.setFont("Helvetica", 12)

        y_position = 730
        line_height = 20

        for task in tasks:
            pdf.drawString(100, y_position, f"Task: {task.task_name} | Status: {task.task_status} | Desc: {task.task_description}")
            # pdf.drawString(100, y_position - 15, f"Description: {task.task_description}")
            y_position -= line_height * 2  

            if y_position < 50:  # Start a new page if space runs out
                pdf.showPage()
                pdf.setFont("Helvetica", 12)
                y_position = 750

        pdf.save()
        buffer.seek(0)

        return FileResponse(buffer, as_attachment=True, filename="task_report.pdf")

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

