import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth/';

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService,  private toastr: ToastrService, private router: Router) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, credentials).pipe(
      tap((response: any) => {
        if (response.access) {
          sessionStorage.setItem('access', response.access);
          sessionStorage.setItem('refresh', response.refresh);
          sessionStorage.setItem('role', response.role || 'viewer');
        } else {
          console.error("No access token received!");
        }
      })
    )
  }

  logout(): void {
    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    this.toastr.info('Logged out successfully!', '', { timeOut: 3000 });
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('access');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  passwordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}password-reset/`, { email });
  }

  profileUpdate(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}profile-update/`, userData);
  }

  getUserRole(): string {
    return sessionStorage.getItem('role') || 'viewer';
  }
}
