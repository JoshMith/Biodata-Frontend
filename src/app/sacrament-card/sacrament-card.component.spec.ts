import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SacramentCardComponent } from './sacrament-card.component';

describe('SacramentCardComponent', () => {
  let component: SacramentCardComponent;
  let fixture: ComponentFixture<SacramentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacramentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SacramentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
