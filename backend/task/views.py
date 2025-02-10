# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework import status, generics
# from .models import Task
# from .serializers import TaskSerializer
# from rest_framework.parsers import JSONParser
# from django.http import JsonResponse
# from django.views import View
# from rest_framework.decorators import permission_classes
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework import filters
# import django_filters
# from django.http import HttpResponse
# from reportlab.pdfgen import canvas
# import io
# from .models import Task
# from django.http import FileResponse
# from reportlab.lib.pagesizes import letter
# from io import BytesIO
# from django.db.models import Q

# class TaskFilter(django_filters.FilterSet):
#     from_date = django_filters.DateFilter(field_name="created_at", lookup_expr='gte')
#     to_date = django_filters.DateFilter(field_name="created_at", lookup_expr='lte')

#     class Meta:
#         model = Task
#         fields = ['task_name', 'task_description', 'task_status', 'from_date', 'to_date']

# #Fetch all tasks & create a new task
# class TaskListCreateAPIView(generics.ListCreateAPIView):
#     queryset = Task.objects.all()
#     serializer_class = TaskSerializer
#     permission_classes = [IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)  # Handles file uploads
#     filterset_class = TaskFilter
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
#     def perform_create(self, serializer):
#         task_file = self.request.FILES.get('task_file')  # Get file
#         serializer.save(task_file=task_file)  # Save task with file


# # Fetch a single task, update, and delete it
# @permission_classes([IsAuthenticated])
# @method_decorator(csrf_exempt, name='dispatch')  #Disable CSRF for this view
# class TaskDetailView(APIView ):
#     parser_classes = [MultiPartParser, FormParser, JSONParser]  #Allow JSON and file uploads

#     def get(self, request, task_id):
#         """Retrieve a single task by ID"""
#         task = get_object_or_404(Task, id=task_id)
#         serializer = TaskSerializer(task)
#         return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

#     def put(self, request, task_id):
#         task = get_object_or_404(Task, id=task_id)
#         serializer = TaskSerializer(task, data=request.data, partial=True)  #request.data
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, task_id):
#         """Delete a task"""
#         task = get_object_or_404(Task, id=task_id)
#         task.delete()
#         return JsonResponse({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    

# def generate_pdf(request):
#     # Extract filter parameters
#     task_name = request.GET.get('task_name', None)
#     task_status = request.GET.getlist('task_status')  #Handles multiple statuses
#     from_date = request.GET.get('from_date', None)
#     to_date = request.GET.get('to_date', None)

#     #If no filters are provided, prevent PDF generation
#     if not any([task_name, task_status, from_date, to_date]):
#         return JsonResponse({"error": "Please apply at least one filter before downloading the report."}, status=400)

#     #Dynamically build filtering query
#     filters = Q()
#     if task_name:
#         filters &= Q(task_name__icontains=task_name)
#     if task_status:
#         filters &= Q(task_status__in=task_status)
#     if from_date and to_date:
#         filters &= Q(created_at__date__range=[from_date, to_date])

#     #Fetch filtered tasks
#     tasks = Task.objects.filter(filters)

#     #Check if tasks exist after filtering
#     if not tasks.exists():
#         return JsonResponse({"error": "No tasks match the selected filters."}, status=400)

#     #Generate PDF
#     buffer = BytesIO()
#     pdf = canvas.Canvas(buffer, pagesize=letter)
#     pdf.drawString(100, 750, "Filtered Task Report")

#     y_position = 730
#     for task in tasks:
#         pdf.drawString(100, y_position, f"Task: {task.task_name}, Status: {task.task_status}")
#         y_position -= 20

#     pdf.save()
#     buffer.seek(0)

#     return FileResponse(buffer, as_attachment=True, filename="task_report.pdf")
















from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status, generics, filters
from rest_framework.response import Response
from rest_framework.pagination import CursorPagination
from rest_framework.decorators import permission_classes
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

# Cursor-Based Pagination
class TaskPagination(CursorPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'  # Allow dynamic page size
    max_page_size = 50  # Prevent very large pages
    ordering = ('id')  # Sorting by newest first

# Filtering tasks
class TaskFilter(django_filters.FilterSet):
    from_date = django_filters.DateFilter(field_name="created_at", lookup_expr='gte')
    to_date = django_filters.DateFilter(field_name="created_at", lookup_expr='lte')
    task_status = django_filters.MultipleChoiceFilter(  # Allow multiple selections
        field_name="task_status",
        choices=Task.STATUS_CHOICES
    )

    class Meta:
        model = Task
        fields = ['task_name', 'task_description', 'task_status', 'from_date', 'to_date']

class TaskStatusListAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        statuses = [{"value": status[0], "label": status[1]} for status in Task.STATUS_CHOICES]
        return Response(statuses)

# List & Create Tasks with Pagination
class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.select_related().all().order_by('-created_at', '-id')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TaskPagination
    # CHECK BOX FILTER
    parser_classes = (MultiPartParser, FormParser)
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    def perform_create(self, serializer):
        """Save task with an optional uploaded file"""
        serializer.save(task_file=self.request.FILES.get('task_file'))

# Retrieve, Update, and Delete a Task
@method_decorator(csrf_exempt, name='dispatch')
class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]  # ✅ Correct way to define permissions in CBVs
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        return JsonResponse(TaskSerializer(task).data, safe=False, status=status.HTTP_200_OK)

    def put(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return JsonResponse({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# Generate and Download Task Report as PDF
def generate_pdf(request):
    """Generate a PDF report based on task filters"""
    filters = Q()
    task_name = request.GET.get('task_name')
    task_status = request.GET.getlist('task_status')
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')

    if task_name:
        filters &= Q(task_name__icontains=task_name)
    if task_status:
        filters &= Q(task_status__in=task_status)
    if from_date and to_date:
        filters &= Q(created_at__date__range=[from_date, to_date])

    tasks = Task.objects.filter(filters)
    if not tasks.exists():
        return JsonResponse({"error": "No tasks match the selected filters."}, status=400)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.drawString(100, 750, "Filtered Task Report")

    y_position = 730
    for task in tasks:
        pdf.drawString(100, y_position, f"Task: {task.task_name}, Status: {task.task_status}")
        y_position -= 20

    pdf.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename="task_report.pdf")

