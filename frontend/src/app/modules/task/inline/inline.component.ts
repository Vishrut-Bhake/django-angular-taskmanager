import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from '../../../../services/task.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatSelect } from '@angular/material/select';
@Component({
  selector: 'app-inline',
  standalone: false,
  templateUrl: './inline.component.html',
  styleUrl: './inline.component.css'
})
export class InlineComponent {
  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'task_name', 'task_description', 'task_status', 'task_priority', 'actions'];
  @ViewChild('select') select!: MatSelect;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;
  tasks: any[] = [];
  searchControl = new FormControl('');
  allSelected: boolean = false;
  selectedStatuses: string[] = [];
  taskStatusOptions: string[] = ['Open', 'In Progress', 'Completed'];
  newTask = { id: '', task_name: '', task_description: '', task_status: '', task_priority: '' };

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      task_name: [''],
      task_description: [''],
      date_range: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((searchValue:any) => {
          return this.taskService.searchTasks(searchValue.trim().toLowerCase());
        })
      )
      .subscribe(tasks => {
        this.dataSource.data = tasks;
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchTasks();
  }

  editTask(task: any) {
    task.isEditing = true;
  }

  saveTask(task: any) {
    task.isEditing = false;
    this.http.put(`http://127.0.0.1:8000/api/tasks/${task.id}/`, task).subscribe(() => {
      this.toastr.success('Task updated successfully');
      this.fetchTasks();
    });
  }

  cancelEdit(task: any) {
    task.isEditing = false;
    this.fetchTasks();
  }

  createTask() {
    if (this.newTask.task_name && this.newTask.task_description) {
      this.http.post('http://127.0.0.1:8000/api/tasks/', this.newTask).subscribe(() => {
        this.toastr.success('Task created successfully');
        this.fetchTasks();
        this.newTask = { id: '', task_name: '', task_description: '', task_status: '', task_priority: '' };
      });
    } else {
      this.toastr.warning('Please fill all required fields');
    }
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.http.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`).subscribe(() => {
        this.toastr.success('Task Deleted Successfully');
        this.fetchTasks();
      });
    }
  }

  fetchTasks() {
    let params = new HttpParams()
      .set('page', (this.currentPage + 1).toString())
      .set('page_size', this.pageSize.toString());

    if (this.filterForm.value.searchQuery) {
      params = params.set('searchQuery', this.filterForm.value.searchQuery);
    }
    if (this.selectedStatuses.length > 0) {
      params = params.set('task_status', this.selectedStatuses.join(','));
    }

    this.http.get<any>('http://127.0.0.1:8000/api/tasks/', { params }).subscribe(response => {
      this.tasks = response.results;
      this.dataSource.data = this.tasks;
      this.totalRecords = response.count;
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchTasks();
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.selectedStatuses = [...this.taskStatusOptions]; // Select all
    } else {
      this.selectedStatuses = []; // Deselect all
    }
    this.applyFilters();
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

  optionClick() {
    // If all individual options are selected, mark "Select All" as checked
    this.allSelected = this.selectedStatuses.length === this.taskStatusOptions.length;
    this.applyFilters();
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


}
