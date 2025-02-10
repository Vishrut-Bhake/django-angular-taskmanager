import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent {
  isEditor: boolean = false;
  userName: string = '';
  userRole: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    debugger
    // Get the username and role from session storage
    this.userName = sessionStorage.getItem('userName') || 'Guest';
    this.userRole = this.authService.getUserRole(); // Fetch role from AuthService
    // Validate and set role-based access
    if ( this.userRole ) {
      this.isEditor =  this.userRole .toLowerCase() === 'editor'; // Editors get full access
    } else {
      this.isEditor = false; // Default to false if no role is found
    }

    console.log(`User: ${this.userName}, Role: ${ this.userRole }, isEditor: ${this.isEditor}`);
  }

  logout() {
    this.authService.logout();
  }
}
