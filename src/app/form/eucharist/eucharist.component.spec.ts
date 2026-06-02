import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EucharistComponent } from './eucharist.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('EucharistComponent', () => {
  let component: EucharistComponent;
  let fixture: ComponentFixture<EucharistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EucharistComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EucharistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
