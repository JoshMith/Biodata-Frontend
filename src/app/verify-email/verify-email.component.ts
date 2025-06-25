import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {
   constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`http://localhost:3000/auth/verifyEmail?token=${token}`)
        .subscribe({
          next: (res: any) => {
            alert(res.message); // optional
            this.router.navigate(['/dashboard']); // ✅ Redirect to dashboard
          },
          error: (err) => {
            alert('Verification failed or expired.');
            this.router.navigate(['/login']); // fallback
          }
        });
    }
  }

}
