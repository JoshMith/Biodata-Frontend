import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'sacrament-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './sacrament-card.component.html',
  styleUrls: ['./sacrament-card.component.css']
})

export class SacramentCardComponent implements OnInit {
  christian: any = null;
  baptism: any = null;
  eucharist: any = null;
  confirmation: any = null;
  marriage: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  language: string = 'en';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('userLoggedIn');
    if (!user) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    const christianId = this.route.snapshot.queryParams['id'] ||
      JSON.parse(localStorage.getItem('selectedChristian') || '{}')?.id;

    if (christianId) {
      this.loadChristianData(christianId);
    } else {
      console.error('No Christian ID provided');
      this.isLoading = false;
      this.errorMessage = 'No Christian ID provided';
    }
  }

  setLanguage(lang: string): void {
    this.language = lang;
  }

  loadChristianData(christianId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getChristianById(christianId).subscribe({
      next: (data) => {
        this.christian = data;
        this.loadSacramentData(christianId);
      },
      error: (err) => {
        console.error('Error loading Christian:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to fetch Christian data';
      }
    });
  }

  loadSacramentData(christianId: string): void {
    forkJoin([
      // Each call is wrapped with catchError so a 404 on one
      // does NOT cause forkJoin to fail entirely.
      this.apiService.getBaptismByUserId(christianId).pipe(
        catchError(err => {
          console.warn('Baptism not found:', err);
          return of([]);
        })
      ),
      this.apiService.getEucharistByUserId(christianId).pipe(
        catchError(err => {
          console.warn('Eucharist not found:', err);
          return of([]);
        })
      ),
      this.apiService.getConfirmationByUserId(christianId).pipe(
        catchError(err => {
          console.warn('Confirmation not found:', err);
          return of([]);
        })
      ),
      this.apiService.getFullMarriageByUserId(christianId).pipe(
        catchError(err => {
          console.warn('Marriage not found:', err);
          return of([]);
        })
      )
    ]).subscribe({
      next: ([baptism, eucharist, confirmation, marriage]) => {
        this.isLoading = false;
        this.baptism     = Array.isArray(baptism)      && baptism.length      > 0 ? baptism[0]      : null;
        this.eucharist   = Array.isArray(eucharist)    && eucharist.length    > 0 ? eucharist[0]    : null;
        this.confirmation= Array.isArray(confirmation) && confirmation.length > 0 ? confirmation[0] : null;
        this.marriage    = Array.isArray(marriage)     && marriage.length     > 0 ? marriage[0]     : null;
      },
      // This error block now only fires if something truly unexpected happens
      // (e.g. network completely down), not for missing records.
      error: (err) => {
        console.error('Unexpected error loading sacrament data:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load sacrament data';
      }
    });
  }

  getSpouseName(): string {
    if (!this.marriage || !this.marriage.parties || !this.marriage.parties.length) {
      return '';
    }

    const christianName = `${this.christian?.first_name || ''} ${this.christian?.last_name || ''}`.trim();

    const spouse = this.marriage.parties.find((party: any) => {
      const partyFullName = party.full_name ||
        `${party.first_name || ''} ${party.last_name || ''}`.trim();
      return partyFullName && partyFullName !== christianName;
    });

    if (spouse) {
      return spouse.full_name ||
        `${spouse.first_name || ''} ${spouse.last_name || ''}`.trim() ||
        (spouse.party_type === 'groom' ? 'Bridegroom' :
          spouse.party_type === 'bride' ? 'Bride' : 'Spouse');
    }

    return '';
  }

  printCard(): void {
    window.print();
  }
}