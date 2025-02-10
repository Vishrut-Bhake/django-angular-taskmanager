import { Component } from '@angular/core';
import { TaskService } from '../../../../services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private taskService: TaskService, private snackBar: MatSnackBar) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  createTask() {
    const formData = new FormData();
    formData.append('task_name', this.newTask.task_name);
    formData.append('task_description', this.newTask.task_description);
    formData.append('task_status', this.newTask.task_status.toLowerCase());
    formData.append('task_priority', this.newTask.task_priority);

    if (this.selectedFile) {
      formData.append('task_file', this.selectedFile);
    }

    this.taskService.createTask(formData).subscribe({
      next: () => this.snackBar.open('Task created successfully!', 'Close', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to create task', 'Close', { duration: 2000 })
    });

    this.newTask = { task_name: '', task_description: '', task_status: 'Open', task_priority: 1 };
    this.selectedFile = null;
  }
}
//   taskForm: FormGroup;
//   selectedFile: File | null = null;

//   constructor(private fb: FormBuilder, private taskService: TaskService) {
//     this.taskForm = this.fb.group({
//       task_name: ['', Validators.required],
//       task_description: ['', Validators.required],
//       task_status: ['Open', Validators.required],
//       task_priority: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
//       task_file: [null]
//     });
//   }

//   onSubmit() {
//     console.log('Form submitted', this.taskForm.value.task_name);

//     if (this.taskForm.valid) {
//       const formData = new FormData();  // ✅ FIXED: `FormData` instead of `obj`

//       formData.append('task_name', this.taskForm.value.task_name);
//       formData.append('task_description', this.taskForm.value.task_description);
//       formData.append('task_status', this.taskForm.value.task_status);
//       formData.append('task_priority', this.taskForm.value.task_priority.toString());  // ✅ FIXED: Corrected property name

//       if (this.selectedFile) {
//         formData.append('task_file', this.selectedFile);  // ✅ Correct field name

//       }

//       this.taskService.createTask(formData).subscribe({
//         next: (response) => {
//           alert('Task Created Successfully!');
//         },
//         error: (error) => {
//           console.error('Task creation failed', error);
//           alert('Failed to create task');
//         }
//       });
//     }
//   }

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }
// }
// constructor(private taskService: TaskService, private router: Router, private snackBar: MatSnackBar) {}
// newTask = { task_name: '', task_description: '', task_status: 'Open', task_priority: 1 };

// // ngOnInit() {
// //   this.loadTasks();
// // }

// createTask() {
//   const formData = new FormData();
//   formData.append('task_name', this.newTask.task_name);
//   formData.append('task_description', this.newTask.task_description);
//   formData.append('task_status', this.newTask.task_status);
//   formData.append('task_priority', this.newTask.task_priority.toString());
  
//   this.taskService.createTask(formData).subscribe({
//     next: (data) => {
//       this.snackBar.open('Task created successfully', 'Close', { duration: 2000 });
//       // this.loadTasks();
//       this.newTask = { task_name: '', task_description: '', task_status: 'Open', task_priority: 1 };
//     },
//     error: (err) => {
//       console.error('Error creating task', err);
//       this.snackBar.open('Failed to create task', 'Close', { duration: 2000 });
//     }
//   });
// }
// }
