from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        task_file = validated_data.pop('task_file', None)  #Ensure correct field name
        task = Task.objects.create(**validated_data)
        if task_file:
            task.task_file = task_file
            task.save()
        return task