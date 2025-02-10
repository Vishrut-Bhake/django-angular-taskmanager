from django.db import models

class Task(models.Model):
    STATUS_CHOICES=(('Open', 'Open'),('In Progress', 'In Progress'),('Completed', 'Completed'),)
    task_name = models.CharField(max_length=255)
    task_description = models.TextField()
    task_status = models.CharField(
        max_length=25,choices=STATUS_CHOICES,default='open')
    
    task_priority = models.IntegerField()
    task_file = models.FileField(upload_to='task_files/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, unique=True)

    def __str__(self):
        return self.task_name
