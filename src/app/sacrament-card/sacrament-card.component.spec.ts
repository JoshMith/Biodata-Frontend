import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SacramentCardComponent } from './sacrament-card.component';
import { ApiService } from '../services/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('SacramentCardComponent', () => {
  let component: SacramentCardComponent;
  let fixture: ComponentFixture<SacramentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacramentCardComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SacramentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
