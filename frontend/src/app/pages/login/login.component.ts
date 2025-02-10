import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ForgotPasswordService } from '../../../services/forgot-password.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isRegistering = false; // Tracks whether to show the registration or login form
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  forgotPasswordForm!: FormGroup; // Fixed: Forgot Password form initialized
  errorMessage: string = "";
  successMessage = '';
  showPassword = false; // Toggle for login password visibility
  showSignupPassword = false; // Toggle for signup password visibility
  showForgotPasswordForm = false; // Control visibility of Forgot Password form

  // Password Validation Flags
  passwordContainsUppercase = false;
  passwordContainsLowercase = false;
  passwordContainsNumber = false;
  passwordContainsSpecialChar = false;

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router,
    private toastr: ToastrService,
    private passwordService: ForgotPasswordService,
    private authService: AuthService,
    private jwtHelper: JwtHelperService
  ) {
    // Initialize login form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    // Initialize signup form
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      tc: [true, Validators.requiredTrue]
    });

    // Initialize forgot password form
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Watch for password changes
    this.signupForm.get('password')?.valueChanges.subscribe((password) => {
      if (password) {
        this.passwordContainsUppercase = /[A-Z]/.test(password);
        this.passwordContainsLowercase = /[a-z]/.test(password);
        this.passwordContainsNumber = /\d/.test(password);
        this.passwordContainsSpecialChar = /[@$!%*?&]/.test(password);
      }
    });
  }

  get fl() {
    return this.loginForm.controls;
  }

  get fs() {
    return this.signupForm.controls;
  }

  // Show Forgot Password Form
  onForgotPassword(): void {
    this.showForgotPasswordForm = true;
  }

  // Handle Forgot Password form submission
  onSubmitForgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      // Call backend to send password reset link
      this.passwordService.forgotPassword(email).subscribe(
        () => {
          this.toastr.success('Password reset link sent!');
          this.showForgotPasswordForm = false; // Hide the form after submission
        },
        () => {
          this.toastr.error('An error occurred. Please try again.');
        }
      );
    }
  }

  // Toggle between login and registration forms
  toggleForm(): void {
    this.isRegistering = !this.isRegistering;
  }

  togglePassword(formType: string) {
    if (formType === 'login') {
      this.showPassword = !this.showPassword;
    } else if (formType === 'signup') {
      this.showSignupPassword = !this.showSignupPassword;
    }
  }

  // Login user
  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const userInfo = this.loginForm.value;
    this.authService.login(userInfo).subscribe(
      (response: any) => {
        sessionStorage.setItem('userName', response.user.username);
        sessionStorage.setItem('userEmail', response.user.email);
        this.router.navigate(['/home']);
      },
      () => {
        this.errorMessage = 'Invalid username or password';
        this.toastr.error(this.errorMessage, '', { timeOut: 3000 });
      }
    );
  }

  // Register new user
  onRegister() {
    const userInfo = this.signupForm.value;
    this.authService.register(userInfo).subscribe(
      () => {
        this.toastr.success("Registered Successfully");
        this.isRegistering = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      (error) => {
        this.errorMessage = error.error.error || 'Signup failed';
        this.successMessage = '';
      }
    );
  }
}
