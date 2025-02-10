import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ForgotPasswordService {
    private apiUrl = 'http://127.0.0.1:8000/api/auth/';
    constructor(private http: HttpClient) { }

    // Request password reset link
    sendResetLink(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}forgot-password/`, { email });
    }

    // Reset the password using the token and user ID
    resetPassword(uid: string, token: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}reset-password/${uid}/${token}/`, { password });
    }
    // Forgot password method
    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}forgot-password/`, { email });
    }
}
