import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationUpdateComponent } from './confirmation.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('ConfirmationUpdateComponent', () => {
  let component: ConfirmationUpdateComponent;
  let fixture: ComponentFixture<ConfirmationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationUpdateComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
