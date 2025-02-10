from django.db import models

class Task(models.Model):
    task_name = models.CharField(max_length=255)
    task_description = models.TextField()
    
    # Directly use a tuple for the status choices
    task_status = models.CharField(
        max_length=25,
        choices=(('open', 'Open'),('in_progress', 'In Progress'),('completed', 'Completed'),),default='open')
    
    task_priority = models.IntegerField()
    task_file = models.FileField(upload_to='task_files/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_name
