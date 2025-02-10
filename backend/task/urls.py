from django.urls import path
from .views import TaskListCreateAPIView, TaskDetailView
from .views import generate_pdf

urlpatterns = [
    path('tasks/', TaskListCreateAPIView.as_view(), name='task-list-create'),
    path('tasks/<int:task_id>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/generate-pdf/', generate_pdf, name='generate_pdf'),
]