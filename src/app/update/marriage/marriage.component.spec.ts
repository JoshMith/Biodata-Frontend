import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarriageUpdateComponent } from './marriage.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('MarriageUpdateComponent', () => {
  let component: MarriageUpdateComponent;
  let fixture: ComponentFixture<MarriageUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarriageUpdateComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarriageUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
