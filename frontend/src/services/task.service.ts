import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Task } from '../app/modules/task/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://127.0.0.1:8000/api/tasks/';

  constructor(private http: HttpClient) { }
  // Fetch Task by ID

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}${taskId}/`);
  }

  // Fetch all tasks
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Fetch tasks with pagination
  getTasks(url?: string): Observable<any> {
    return this.http.get<Task[]>(url || this.apiUrl);
  }

  createTask(task: FormData): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: FormData): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}${id}/`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  generatePdf(filters: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${this.apiUrl}generate-pdf/?${queryParams}`;

    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to generate PDF");
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'task_report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => console.error("Error generating PDF:", error));
  }

  // Search tasks with filtering
  // searchTasks(searchValue: string): Observable<Task[]> {
  //   const trimmedSearch = searchValue.trim().toLowerCase();
  //   return this.http.get<{ tasks: Task[] }>(`${this.apiUrl}?search=${encodeURIComponent(trimmedSearch)}`)
  //     .pipe(map(response => response.tasks));
  // }
  searchTasks(searchValue: string): Observable<Task[]> {
    const trimmedSearch = searchValue.trim().toLowerCase();
    return this.http.get<{ results: Task[] }>(`${this.apiUrl}?search=${encodeURIComponent(trimmedSearch)}`)
      .pipe(map(response => response.results)); // Ensure correct response structure
  }

}