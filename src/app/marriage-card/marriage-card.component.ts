import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { catchError, of } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-marriage-card',
  imports: [NgIf],
  standalone: true,
  templateUrl: './marriage-card.component.html',
  styleUrls: ['./marriage-card.component.css']
})
export class MarriageCardComponent implements OnInit {
  marriageData: any = null;
  groom: any = null;
  bride: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private marriageService: ApiService) {}

  ngOnInit(): void {
    this.fetchMarriageData();
  }

  fetchMarriageData() {
    const selectedChristian = localStorage.getItem('selectedChristian');
    let userId = '';

    if (selectedChristian) {
      userId = JSON.parse(selectedChristian).id;
    }

    if (!userId) {
      this.isLoading = false;
      this.errorMessage = 'User ID not found in localStorage';
      return;
    }

    this.marriageService.getFullMarriageByUserId(userId)
      .pipe(
        catchError(error => {
          this.isLoading = false;
          this.errorMessage = 'Failed to fetch marriage data';
          return of(null);
        })
      )
      .subscribe((data: any) => {
        this.isLoading = false;
        if (data && data.length > 0) {
          this.marriageData = data[0];
          this.processPartiesData();
        } else {
          this.errorMessage = 'No marriage certificate found for this user';
        }
      });
  }

  private processPartiesData() {
    if (this.marriageData && this.marriageData.parties) {
      this.groom = this.marriageData.parties.find((p: any) => p.party_type === 'groom');
      this.bride = this.marriageData.parties.find((p: any) => p.party_type === 'bride');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  printCertificate() {
    window.print();
  }
}