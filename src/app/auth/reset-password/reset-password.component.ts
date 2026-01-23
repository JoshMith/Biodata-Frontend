import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})


export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isValidToken = false;
  isCheckingToken = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token from URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.verifyToken();
      } else {
        this.isCheckingToken = false;
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  verifyToken(): void {
    this.apiService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.isValidToken = true;
        this.isCheckingToken = false;
      },
      error: (error) => {
        this.isValidToken = false;
        this.isCheckingToken = false;
        this.errorMessage = error.error?.message || 'This reset link is invalid or has expired.';
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    this.apiService.resetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset successful!';
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
