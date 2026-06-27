import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


export interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage = '';
  loginMessage = '';
  isLoading: boolean = false; // To indicate loading state
  showPassword = false;

  constructor(private router: Router, private login: ApiService) { }

  // private login = inject(ApiService)
  private fb = inject(FormBuilder)
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  })

  ngOnInit(): void {
    // this.onSubmit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.loginMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.')
      return;
    }
    this.loginMessage = 'Logging in...';
    this.errorMessage = '';
    this.login.loginChristian(this.form.value).subscribe(
      (response) => {
        localStorage.setItem('userLoggedIn', JSON.stringify(response.user));
        console.log('Login successful:', response.user.email);
        // console.log(this.form);
        // Store the token in local storage or session storage
        // localStorage.setItem('token', response.token); // Adjust according to your API response
        this.loginMessage = '';
        this.errorMessage = '';
        this.successMessage = 'Login successful! Redirecting to dashboard...';
        // Set loading state to true
        // this.isLoading = true;
        this.navigateToDashboard();
        // Remove userLoggedIn after 1 hour
        setTimeout(() => {
          localStorage.removeItem('userLoggedIn');
        }, 86400000); // 24 hours in milliseconds

      },
      (error: any) => {
        this.loginMessage = '';
        console.error('Login failed:', error);
        this.errorMessage = error.error.message || 'Invalid email or password. Please try again.';
      });
  }

  navigateToDashboard(): void {
    setTimeout(() => {
      const raw = localStorage.getItem('userLoggedIn');
      const user = raw ? JSON.parse(raw) : null;
      const role = user?.role;

      if (role === 'member') {
        this.router.navigate(['/dashboard/member']);
      } else if (role === 'parishadmin' || role === 'parishviewer' || role === 'secretary') {
        this.router.navigate(['/dashboard/editor']);
      } else if (role === 'superadmin' || role === 'superviewer') {
        this.router.navigate(['/dashboard']);
      } else if(role ==="deaneryviewer"){
        this.router.navigate(['/dashboard/deanery'])
      }
      else {
        this.router.navigate(['/login']);
      }
    }, 1500);
  }

  navigateToRegister(): void {
    setTimeout(() => {
      this.router.navigate(['/register']);
    }, 1000); // Delay to show registration page
  }
}
