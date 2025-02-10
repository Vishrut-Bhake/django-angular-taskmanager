import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EdittaskComponent } from '../edittask/edittask.component';

@Component({
  selector: 'app-viewtask',
  templateUrl: './viewtask.component.html',
  styleUrls: ['./viewtask.component.css'],
  standalone: false,
})
export class ViewtaskComponent implements OnInit {
  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'task_name', 'task_description', 'task_status', 'task_priority', 'actions'];
  taskStatusOptions: string[] = ['Open', 'In Progress', 'Completed'];
  selectedStatuses: string[] = [];
  
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;
  filterText: string = '';
  filteredTasks: any[] = [];
  tasks: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      task_name: [''],
      task_description: [''],
      date_range: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit() {
    this.fetchTasks();
  }
  
  applyFilters() {
    this.currentPage = 0;
    this.fetchTasks();
  }

  resetFilters() {
    this.filterForm.reset();
    this.selectedStatuses = [];
    this.applyFilters();
  }

  toggleStatusFilter(status: string) {
    if (this.selectedStatuses.includes(status)) {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    } else {
      this.selectedStatuses.push(status);
    }
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchTasks();
  }

  editTask(taskId: number) {
    const dialogRef = this.dialog.open(EdittaskComponent, {
      width: '400px',
      data: { taskId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchTasks();
      }
    });
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.http.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`).subscribe(() => {
        this.toastr.success('Task Deleted Successfully', '', { timeOut: 2000 });
        this.fetchTasks();
      });
    }
  }

  downloadPDF() {
    let params = new HttpParams();
    if (this.filterForm.value.task_name) {
      params = params.set('task_name', this.filterForm.value.task_name);
    }
    if (this.selectedStatuses.length > 0) {
      params = params.set('task_status', this.selectedStatuses.join(','));
    }
    if (this.filterForm.value.date_range?.start) {
      params = params.set('from_date', this.filterForm.value.date_range.start);
    }
    if (this.filterForm.value.date_range?.end) {
      params = params.set('to_date', this.filterForm.value.date_range.end);
    }

    if (!params.keys().length) {
      this.toastr.warning('Please select at least one filter before downloading the report.');
      return;
    }

    const pdfUrl = `http://127.0.0.1:8000/api/tasks/generate-pdf/?${params.toString()}`;
    fetch(pdfUrl)
      .then(response => response.blob())
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
      .catch(error => this.toastr.error('Error downloading PDF'));
  }

  applySearchFilter(): void {
    const searchValue = this.filterText.toLowerCase().trim();
    if (!searchValue) {
      this.dataSource.data = this.tasks; // Reset to original data
      return;
    }
    this.dataSource.data = this.tasks.filter(task =>
      task.task_name.toLowerCase().includes(searchValue) ||
      task.task_description.toLowerCase().includes(searchValue) ||
      task.task_status.toLowerCase().includes(searchValue)
    );
  }

  fetchTasks() {
    let params = new HttpParams()
      .set('page', (this.currentPage + 1).toString())
      .set('page_size', this.pageSize.toString());
  
    if (this.filterForm.value.task_name) {
      params = params.set('task_name', this.filterForm.value.task_name);
    }
    if (this.filterForm.value.task_description) {
      params = params.set('task_description', this.filterForm.value.task_description);
    }
    if (this.filterForm.value.date_range?.start) {
      params = params.set('start_date', this.filterForm.value.date_range.start);
    }
    if (this.filterForm.value.date_range?.end) {
      params = params.set('end_date', this.filterForm.value.date_range.end);
    }
    if (this.selectedStatuses.length > 0) {
      params = params.set('task_status', this.selectedStatuses.join(','));
    }
  
    this.http.get<any>('http://127.0.0.1:8000/api/tasks/', { params }).subscribe((response) => {
      this.tasks = response.results;  // Store all fetched tasks
      this.dataSource.data = this.tasks;
      this.totalRecords = response.count;
    });
  }
  
}
