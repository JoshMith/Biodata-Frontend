import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-dashboard.component.html',
  styleUrl: './editor-dashboard.component.css'
})
export class EditorDashboardComponent implements OnInit {
  user: any = null;
  parishName = '';
  deaneryName = '';
  isLoading = true;

  stats = {
    christians: 0,
    baptised: 0,
    eucharist: 0,
    confirmed: 0,
    married: 0
  };

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(raw);

    forkJoin({
      parish: this.user.parishId
        ? this.apiService.getParishById(this.user.parishId).pipe(catchError(() => of(null)))
        : of(null),
      count: this.apiService.getChristianCount().pipe(catchError(() => of({ userCount: 0 }))),
      baptisms: this.apiService.getBaptisms().pipe(catchError(() => of([]))),
      eucharists: this.apiService.getEucharists().pipe(catchError(() => of([]))),
      confirmations: this.apiService.getConfirmations().pipe(catchError(() => of([]))),
      marriages: this.apiService.getMarriages().pipe(catchError(() => of([])))
    }).subscribe(({ parish, count, baptisms, eucharists, confirmations, marriages }) => {
      if (parish) {
        this.parishName = parish.parish_name;
        this.deaneryName = parish.deanery;
      }
      this.stats.christians = count.userCount;
      this.stats.baptised = (baptisms as any[]).length;
      this.stats.eucharist = (eucharists as any[]).length;
      this.stats.confirmed = (confirmations as any[]).length;
      this.stats.married = (marriages as any[]).length;
      this.isLoading = false;
    });
  }

  get currentYear(): number { return new Date().getFullYear(); }

  navigate(path: string): void { this.router.navigate([path]); }

  logout(): void {
    this.apiService.logoutChristian(this.user?.email).subscribe({
      next: () => { localStorage.removeItem('userLoggedIn'); this.router.navigate(['/login']); },
      error: () => { localStorage.removeItem('userLoggedIn'); this.router.navigate(['/login']); }
    });
  }
}