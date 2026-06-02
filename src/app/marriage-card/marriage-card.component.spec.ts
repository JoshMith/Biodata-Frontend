import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarriageCardComponent } from './marriage-card.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../services/api.service';

describe('MarriageCardComponent', () => {
  let component: MarriageCardComponent;
  let fixture: ComponentFixture<MarriageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarriageCardComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarriageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
