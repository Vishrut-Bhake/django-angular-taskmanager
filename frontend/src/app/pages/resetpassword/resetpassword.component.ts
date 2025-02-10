import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordService } from '../../../services/forgot-password.service'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-resetpassword',
  standalone: false,
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css'
})
export class ResetpasswordComponent implements OnInit{
  resetPasswordForm: FormGroup;
  uid!: string;
  token!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private forgotPasswordService: ForgotPasswordService,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Get the UID and Token from the URL
    this.route.params.subscribe((params) => {
      this.uid = params['uid'];
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) return;

    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.forgotPasswordService
      .resetPassword(this.uid, this.token, password)
      .subscribe(
        (response) => {
          this.toastr.success('Password reset successful.');
          this.router.navigate(['/login']);
        },
        (error) => {
          this.toastr.error('Password reset failed.');
        }
      );
  }

}
