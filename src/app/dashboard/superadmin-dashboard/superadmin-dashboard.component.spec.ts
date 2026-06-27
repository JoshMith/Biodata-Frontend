import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminDashboardComponent } from './superadmin-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import it from '@angular/common/locales/it';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('SuperuserDashboardComponent', () => {
  let component: SuperadminDashboardComponent;
  let fixture: ComponentFixture<SuperadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminDashboardComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SuperadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
