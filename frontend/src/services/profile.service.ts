import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth/';

  constructor(private http: HttpClient) {}

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}profile-update/`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}password-reset/`, data);
  }
}
