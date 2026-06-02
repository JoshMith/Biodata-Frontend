import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoUpdateComponent } from './personal-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('PersonalInfoUpdateComponent', () => {
  let component: PersonalInfoUpdateComponent;
  let fixture: ComponentFixture<PersonalInfoUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoUpdateComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalInfoUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
