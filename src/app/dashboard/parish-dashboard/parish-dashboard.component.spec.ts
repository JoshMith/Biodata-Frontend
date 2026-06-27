import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParishDashboardComponent } from './parish-dashboard.component';

describe('ParishDashboardComponent', () => {
  let component: ParishDashboardComponent;
  let fixture: ComponentFixture<ParishDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParishDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParishDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
