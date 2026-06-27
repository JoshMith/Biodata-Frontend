import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-deanery-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deanery-dashboard.component.html',
  styleUrl: './deanery-dashboard.component.css'
})
export class DeaneryDashboardComponent implements OnInit {

  user: any = null;
  isLoading = true;

  // deanery scoped
  deaneryName = '';

  stats = {
    christians: 0,
    baptised: 0,
    eucharist: 0,
    confirmed: 0,
    married: 0
  };

  parishes: { name: string; count: number }[] = [];
  maxParishCount = 1;

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');

    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }



    this.user = JSON.parse(raw);

    if (this.user.role !== 'deaneryviewer') {
      this.router.navigate(['/dashboard']);
      return;
    }

    // optional: if backend sends deanery in token/user
    this.deaneryName = this.user.deanery || 'My Deanery';

    forkJoin({
      users: this.apiService.getChristians().pipe(catchError(() => of([]))),
      baptisms: this.apiService.getBaptisms().pipe(catchError(() => of([]))),
      eucharists: this.apiService.getEucharists().pipe(catchError(() => of([]))),
      confirmations: this.apiService.getConfirmations().pipe(catchError(() => of([]))),
      marriages: this.apiService.getMarriages().pipe(catchError(() => of([]))),
      parishes: this.apiService.getParishes().pipe(catchError(() => of([])))
    }).subscribe(({ users, baptisms, eucharists, confirmations, marriages, parishes }) => {

      const u = users as any[];
      const p = parishes as any[];

      // IMPORTANT: backend already filters deanery users
      this.stats.christians = u.length;
      this.stats.baptised = (baptisms as any[]).length;
      this.stats.eucharist = (eucharists as any[]).length;
      this.stats.confirmed = (confirmations as any[]).length;
      this.stats.married = (marriages as any[]).length;

      // ONLY parishes in THIS deanery
      const deaneryParishes = p.filter(par => par.deanery === this.deaneryName);

      this.parishes = deaneryParishes.map(par => ({
        name: par.parish_name,
        count: u.filter((usr: any) => usr.parish_id === par.parish_id).length
      })).sort((a, b) => b.count - a.count);

      this.maxParishCount = Math.max(...this.parishes.map(p => p.count), 1);

      this.isLoading = false;
    });
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    localStorage.removeItem('userLoggedIn');
    this.router.navigate(['/login']);
  }
}