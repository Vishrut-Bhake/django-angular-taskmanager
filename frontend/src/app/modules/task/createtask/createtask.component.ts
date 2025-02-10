import { Component } from '@angular/core';
import { TaskService } from '../../../../services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createtask',
  standalone: false,
  templateUrl: './createtask.component.html',
  styleUrls: ['./createtask.component.css']  // ✅ FIXED: Corrected `styleUrl` to `styleUrls`
})
export class CreatetaskComponent {

  newTask: any = {
    task_name: '',
    task_description: '',
    task_status: 'Open',
    task_priority: 1
  };
  selectedFile: File | null = null;
  constructor(private taskService: TaskService, private snackBar: MatSnackBar, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  createTask() {
    const formData = new FormData();
    formData.append('task_name', this.newTask.task_name);
    formData.append('task_description', this.newTask.task_description);
    formData.append('task_status', this.newTask.task_status);
    formData.append('task_priority', this.newTask.task_priority);

    if (this.selectedFile) {
      formData.append('task_file', this.selectedFile);
    }

    this.taskService.createTask(formData).subscribe({
      next: () =>{
        this.snackBar.open('Task created successfully!', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to create task', 'Close', { duration: 2000 })
    });

    this.newTask = { task_name: '', task_description: '', task_status: 'Open', task_priority: 1 };
    this.selectedFile = null;
  }
}