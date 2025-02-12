import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EdittaskComponent } from '../edittask/edittask.component';
import { TaskService } from '../../../../services/task.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatSelect } from '@angular/material/select';
@Component({
  selector: 'app-readonly',
  standalone: false,
  templateUrl: './readonly.component.html',
  styleUrl: './readonly.component.css'
})
export class ReadonlyComponent implements OnInit, AfterViewInit {
  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'task_name', 'task_description', 'task_status', 'task_priority'];
  @ViewChild('select') select!: MatSelect;

  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;
  filteredTasks: any[] = [];
  tasks: any[] = [];
  searchControl = new FormControl('');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  allSelected: boolean = false;
  selectedStatuses: string[] = [];
  taskStatusOptions: string[] = ['Open', 'In Progress', 'Completed'];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      // Combined search field
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
        debounceTime(600), // Waits 300ms after typing stops
        distinctUntilChanged(), // Avoids duplicate API calls for same input
        switchMap(searchValue => {
          if (searchValue === null) {
            return [];
          }
          return this.taskService.searchTasks(searchValue.trim().toLowerCase());
        })
      )
      .subscribe(tasks => {
        this.dataSource.data = tasks;
      });

    // this.fetchTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchTasks(); // Load tasks after paginator is initialized
  }


  toggleAllSelection() {
    if (this.allSelected) {
      this.selectedStatuses = [...this.taskStatusOptions]; // Select all
    } else {
      this.selectedStatuses = []; // Deselect all
    }
    this.applyFilters();
  }

  optionClick() {
    // If all individual options are selected, mark "Select All" as checked
    this.allSelected = this.selectedStatuses.length === this.taskStatusOptions.length;
    this.applyFilters();

  }

  onStatusChange(event: any) {
    const selectedValues = event.value;

    if (selectedValues.includes('All')) {
      if (this.selectedStatuses.length === this.taskStatusOptions.length) {
        // If "All" is selected and everything is already selected, clear selection
        this.selectedStatuses = [];
      } else {
        // Select all statuses if "All" is chosen
        this.selectedStatuses = [...this.taskStatusOptions];
      }
    } else {
      // Remove "All" if any specific status is unchecked
      this.selectedStatuses = selectedValues.filter((status: any) => status !== 'All');

      // If all statuses are selected, include "All"
      if (this.selectedStatuses.length === this.taskStatusOptions.length) {
        this.selectedStatuses.unshift('All');
      }
    }

    this.applyFilters();
  }

  // Function to check if all statuses are selected
  isAllSelected(): boolean {
    return this.selectedStatuses.length === this.taskStatusOptions.length;
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


  fetchTasks() {
    let params = new HttpParams()
      .set('page', (this.currentPage + 1).toString())
      .set('page_size', this.pageSize.toString());

    if (this.filterForm.value.searchQuery) {
      params = params.set('searchQuery', this.filterForm.value.searchQuery);
    }
    if (this.filterForm.value.task_name) {
      params = params.set('task_name', this.filterForm.value.task_name);
    }
    if (this.filterForm.value.task_description) {
      params = params.set('task_description', this.filterForm.value.task_description);
    }
    // ✅ Fix: Ensure date is formatted correctly before sending it
    const startDate = this.filterForm.value.date_range?.start;
    const endDate = this.filterForm.value.date_range?.end;
    if (this.filterForm.value.date_range?.start) {
      params = params.set('start_date', this.filterForm.value.date_range.start);
    }
    if (this.filterForm.value.date_range?.end) {
      params = params.set('end_date', this.filterForm.value.date_range.end);
    }
    // Handle multi-select task statuses
    if (this.selectedStatuses.length > 0) {
      params = params.set('task_status', this.selectedStatuses.join(','));
    }


    this.http.get<any>('http://127.0.0.1:8000/api/tasks/', { params }).subscribe({
      next: (response) => {
        this.tasks = response.results;
        this.dataSource.data = this.tasks;
        this.totalRecords = response.count;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        });
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
  }

  downloadPDF() {
    let params = new HttpParams();
    console.log(params.toString())
    if (this.filterForm.value.searchQuery) {
      params = params.set('searchQuery', this.filterForm.value.searchQuery.trim());
    }

    if (this.filterForm.value.task_name) {
      params = params.set('task_name', this.filterForm.value.task_name.trim());
    }

    if (this.selectedStatuses.length > 0) {
      params = params.set('task_status', this.selectedStatuses.join(','));  //No encodeURIComponent needed
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

    fetch(pdfUrl, { method: 'GET' }) 
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to download PDF. Status: ${response.status}`);
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
        this.toastr.success('PDF downloaded successfully!');
      })
      .catch(error => this.toastr.error('Error downloading PDF: ' + error.message));
  }
}
