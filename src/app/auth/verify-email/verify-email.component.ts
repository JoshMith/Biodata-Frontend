import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  successMessage = '';
  whereTo = '';
  state = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`http://localhost:3000/auth/verifyEmail?token=${token}`)
        .subscribe({
          next: () => {
            this.state = "Verified!"
            this.successMessage = "Verification Successful! Continue to Dasboard"
            this.whereTo = "Dashboard"
            console.log("Verification successful. Redirecting to Dashboard...")
          },
          error: () => {
            this.state = "Not Verified!"
            this.successMessage = "Verification Failed! Try Again."
            this.whereTo = "Login"
            console.log("Verification failed! Redirecting to Login...")
          }
        });
    }
  }

  public navigate() {
    if (this.state === "Verified!") {
      this.router.navigate(['/dashboard']);
    } else if (this.state === "Not Verified!") {
      this.router.navigate(['/login']);
    }
  }

}
