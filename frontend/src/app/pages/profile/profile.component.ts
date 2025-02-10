import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})   
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      user_name: ['', [Validators.required, Validators.minLength(3)]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  
    this.loadUserProfile();
  }

  // Load User Data (Assumes user info is stored in sessionStorage)
  loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userDeatils') || '{}');
    this.profileForm.patchValue(userData);
  }

  // Update Profile
  updateProfile() {
    if (this.profileForm.invalid) return;

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('userDeatils', JSON.stringify(this.profileForm.value)); 
        sessionStorage.setItem('userName', this.profileForm.value.user_name);
        this.toastr.success(res.message, '', { timeOut: 2000 });
        this.router.navigate(['/home']);
      },
      error: (err) => this.toastr.error(err.error.error || "Failed to update profile.")
    });
  }
}
