import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common'; // Add this import

@Component({
  selector: 'sacrament-card',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './sacrament-card.component.html',
  styleUrls: ['./sacrament-card.component.css']
})

export class SacramentCardComponent implements OnInit {
  christian: any = null;
  baptism: any = null;
  eucharist: any = null;
  confirmation: any = null;
  marriage: any = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const christianId = this.route.snapshot.queryParams['id'] ||
      JSON.parse(localStorage.getItem('selectedChristian') || '{}')?.id;

    if (christianId) {
      this.loadChristianData(christianId);
    } else {
      console.error('No Christian ID provided');
    }
  }

  loadChristianData(christianId: string): void {
    this.apiService.getChristianById(christianId).subscribe({
      next: (data) => {
        this.christian = data;
        this.loadSacramentData(christianId);
      },
      error: (err) => console.error('Error loading Christian:', err)
    });
  }

  loadSacramentData(christianId: string): void {
    forkJoin([
      this.apiService.getBaptismByUserId(christianId),
      this.apiService.getEucharistByUserId(christianId),
      this.apiService.getConfirmationByUserId(christianId),
      this.apiService.getFullMarriageByUserId(christianId)
    ]).subscribe({
      next: ([baptism, eucharist, confirmation, marriage]) => {
        this.baptism = baptism.length > 0 ? baptism[0] : null;
        this.eucharist = eucharist.length > 0 ? eucharist[0] : null;
        this.confirmation = confirmation.length > 0 ? confirmation[0] : null;
        this.marriage = marriage.length > 0 ? marriage[0] : null;
      },
      error: (err) => console.error('Error loading sacrament data:', err)
    });
  }

  getSpouseName(): string {
    if (!this.marriage || !this.marriage.parties || !this.marriage.parties.length) {
      return '';
    }

    // Get current Christian's full name
    const christianName = `${this.christian?.first_name || ''} ${this.christian?.last_name || ''}`.trim();

    // Find the spouse (party that isn't the current Christian)
    const spouse = this.marriage.parties.find((party: any) => {
      // Try different possible name properties
      const partyFullName = party.full_name ||
        `${party.first_name || ''} ${party.last_name || ''}`.trim();
      return partyFullName && partyFullName !== christianName;
    });

    // Return the spouse's name in the best available format
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