import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaptismUpdateComponent } from './baptism.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('BaptismUpdateComponent', () => {
  let component: BaptismUpdateComponent;
  let fixture: ComponentFixture<BaptismUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaptismUpdateComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaptismUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
