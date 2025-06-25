import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router, private apiService: ApiService) { }
  christianCount: number = 0; // Added to store the count value

  showBanner: boolean = false; // Added to control banner visibility
  bannerMessage: string = ''; // Added to store banner message


  ngOnInit(): void {
    this.loadUserCount();

    const userData = localStorage.getItem('userLoggedIn');
    if (userData) {
      const user = JSON.parse(userData);
      const role = user.roles;

      if (role === 'superuser') {
        this.showBanner = true;
        this.bannerMessage = `You are logged in as SUPERUSER. You have full access to view and manage all Christians in the system.`;
      } else if (role === 'editor' ) {
        this.showBanner = true;
        this.bannerMessage = `You are logged in as EDITOR. You can view and manage Christians from your own parish only.`;
      } else if (role === 'viewer') {
        this.showBanner = true;
        this.bannerMessage = `You are logged in as VIEWER. You only have view access.`;
      } else {
        this.showBanner = true;
        this.bannerMessage = 'You are not logged in. Go to login page.';
        setTimeout(() => {
          if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
        }, 3000);
      }
    }
  }


  loadUserCount(): void {
    this.apiService.getChristianCount().subscribe(
      (response: any) => {
        this.christianCount = response.userCount;
        console.log('User count:', this.christianCount);
      },
      (error) => {
        console.error('Error fetching user count:', error);
      }
    );
  }


  navigateToSearch() {
    setTimeout(() => {
      this.router.navigate(['/search'])
    }, 1500);
  }

  navigateToForm() {
    setTimeout(() => {
      this.router.navigate(['/personal-info'])
    }, 1500);
  }

  logoutChristian() {
    const localStorageData = localStorage.getItem('userLoggedIn');

    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      const email = parsedData?.email;
      if (email) {
        this.apiService.logoutChristian(email).subscribe(
          (response) => {
            console.log('Logout successful:', response);
            alert('Logout successful! Redirecting to login...');
            localStorage.removeItem('userLoggedIn');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          },
          (error: any) => {
            console.error('Logout failed:', error);
            alert('Logout failed: ' + error.error.message);
          }
        );
      }
    } else {
      console.error('No email found in local storage.');
      confirm('Logout failed: No user information found. Do you want to go to the login page?');
      this.router.navigate(['/login']);
      // Optionally, you can also clear the local storage here
      localStorage.removeItem('userLoggedIn');
    }
  }

}
