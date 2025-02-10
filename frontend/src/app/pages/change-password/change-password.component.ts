import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  passwordForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router
  ) { }
  ngOnInit() {

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loadUserProfile();
  }

  // Load User Data (Assumes user info is stored in sessionStorage)
  loadUserProfile() {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  // Change Password
  changePassword() {
    if (this.passwordForm.invalid) return;

    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.router.navigate(['/home']);
        this.toastr.success(res.message);
      },
      error: (err) => this.toastr.error(err.error.error || "Failed to change password.")
    });
  }
}
