import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperuserDashboardComponent } from './superuser-dashboard.component';

describe('SuperuserDashboardComponent', () => {
  let component: SuperuserDashboardComponent;
  let fixture: ComponentFixture<SuperuserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperuserDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperuserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
