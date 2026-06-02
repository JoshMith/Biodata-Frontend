import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaptismComponent } from './baptism.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('BaptismComponent', () => {
  let component: BaptismComponent;
  let fixture: ComponentFixture<BaptismComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaptismComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BaptismComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
