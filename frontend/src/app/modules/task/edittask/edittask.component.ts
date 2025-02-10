import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../../../services/task.service';
import { ViewtaskComponent } from '../viewtask/viewtask.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edittask',
  standalone: false,
  templateUrl: './edittask.component.html',
  styleUrl: './edittask.component.css'
})
export class EdittaskComponent implements OnInit {
  editTaskForm!: FormGroup;
  isLoading = true; // Loader flag
  selectedFile: File | null = null;
  taskFileUrl: string | null = null;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<ViewtaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: number }
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.editTaskForm = this.fb.group({
      task_name: ['', Validators.required],
      task_description: ['', Validators.required],
      task_status: ['', Validators.required],
      task_priority: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      task_file: [null] // File field (not required)
    });

    // Fetch task details from backend
    this.taskService.getTaskById(this.data.taskId).subscribe({
      next: (task) => {
        this.editTaskForm.patchValue(task); // Populate form fields
        if (task.task_file) {
          this.taskFileUrl = task.task_file; // Show existing file link
        }
        this.isLoading = false;
      },
      error: (err) => console.error('Error fetching task', err)
    });
  }

  // Handle File Selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // ✅ Submit updated task data
  updateTask() {
    if (this.editTaskForm.invalid) return;
    const formData = new FormData();
    formData.append('task_name', this.editTaskForm.get('task_name')?.value);
    formData.append('task_description', this.editTaskForm.get('task_description')?.value);
    formData.append('task_status', this.editTaskForm.get('task_status')?.value);
    formData.append('task_priority', this.editTaskForm.get('task_priority')?.value);
    
    if (this.selectedFile) {
      formData.append('task_file', this.selectedFile);
    }

    this.taskService.updateTask(this.data.taskId, formData).subscribe({
      next: () => {
        this.toastr.success('Task updated successfully', '', { timeOut: 2000 });
        this.dialogRef.close(true); // Close the dialog and refresh list
      },
      error: (err) => console.error('Error updating task', err)
    });
  }

  // Close dialog without saving
  cancel() {
    this.dialogRef.close(false);
  }
}
