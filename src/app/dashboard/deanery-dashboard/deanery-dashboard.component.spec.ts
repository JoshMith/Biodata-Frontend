import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaneryDashboardComponent } from './deanery-dashboard.component';

describe('DeaneryDashboardComponent', () => {
  let component: DeaneryDashboardComponent;
  let fixture: ComponentFixture<DeaneryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeaneryDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeaneryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
