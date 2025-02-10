import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TaskService } from '../../../../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { EdittaskComponent } from '../edittask/edittask.component';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-viewtask',
  templateUrl: './viewtask.component.html',
  styleUrls: ['./viewtask.component.css'],
  standalone: false
})
export class ViewtaskComponent implements OnInit {
  tasks: any[] = [];
  displayedColumns: string[] = ['id', 'task_name', 'task_description', 'task_status', 'task_priority', 'actions'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm!: FormGroup | any;

  //Task Status Options for Checkbox Filtering
  taskStatusOptions = ['Open', 'In Progress', 'Completed'];
  selectedStatuses: string[] = [];

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      task_name: [''],
      task_description: [''],
      date_range: this.fb.group({ 
        start: [null],
        end: [null]
      })
    }); 

    this.getAllTasks();
  }

  getAllTasks() {
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.dataSource = new MatTableDataSource(this.tasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error('Error fetching tasks', err)
    });
  }

  // Apply Filters including Checkbox Status Filter
  applyFilters() {
    const filters = this.filterForm.value;
    let filteredTasks = [...this.tasks];
    this.taskService.generatePdf(filters);

    if (filters.task_name) {
      filteredTasks = filteredTasks.filter(task =>
        task.task_name.toLowerCase().includes(filters.task_name)
      );
    }

    if (filters.task_description) {
      filteredTasks = filteredTasks.filter(task =>
        task.task_description.toLowerCase().includes(filters.task_description)
      );
    }

     // Date Range Filtering
     if (filters.date_range && filters.date_range.start && filters.date_range.end) {
      const fromDate = new Date(filters.date_range.start).getTime();
      const toDate = new Date(filters.date_range.end).getTime();
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.created_at).getTime();
        return taskDate >= fromDate && taskDate <= toDate;
      });
      
    }

    // Apply Task Status Checkbox Filter
    if (this.selectedStatuses.length > 0) {
      filteredTasks = filteredTasks.filter(task => this.selectedStatuses.includes(task.task_status));      
    }

    this.dataSource.data = filteredTasks;
  }

  // Reset Filters
  resetFilters() {
    this.filterForm.reset();
    this.selectedStatuses = [];
    this.getAllTasks();
  }

  // Toggle Checkbox Selection
  toggleStatusFilter(status: string) {
    const index = this.selectedStatuses.indexOf(status);
    if (index === -1) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses.splice(index, 1);
    }
    this.applyFilters();
  }

  // Open Edit Task Dialog
  editTask(taskId: number) {
    const dialogRef = this.dialog.open(EdittaskComponent, {
      width: '400px',
      data: { taskId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllTasks();
      }
    });
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.dataSource.data = this.tasks;
        this.toastr.success('Task Deleted successfully', '', { timeOut: 2000 });
      });
    }
  }

  downloadPDF() {
    const params: any = new URLSearchParams();
    if (this.filterForm.value.task_name) {
      params.append('task_name', this.filterForm.value.task_name);
    }
    if (this.selectedStatuses.length > 0) {
     this.selectedStatuses.forEach(status => params.append('task_status', status));
    }
    if (this.filterForm.value.date_range?.start && this.filterForm.value.date_range?.end) {
      params.append('from_date', this.filterForm.value.date_range.start.toISOString().split('T')[0]);
      params.append('to_date', this.filterForm.value.date_range.end.toISOString().split('T')[0]);
    }
    if (!params.toString()) {
      this.toastr.warning('Please select at least one filter before downloading the report.');
      return;
    }
    const pdfUrl = `http://localhost:8000/api/tasks/generate-pdf/?${params.toString()}`;
    fetch(pdfUrl)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error); });
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task_report.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => alert(error.message));
  }
}  
