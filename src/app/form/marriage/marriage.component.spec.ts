import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarriageComponent } from './marriage.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('MarriageComponent', () => {
  let component: MarriageComponent;
  let fixture: ComponentFixture<MarriageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarriageComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarriageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
