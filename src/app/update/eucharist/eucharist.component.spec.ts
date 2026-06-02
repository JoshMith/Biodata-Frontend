import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EucharistUpdateComponent } from './eucharist.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../services/api.service';

describe('EucharistUpdateComponent', () => {
  let component: EucharistUpdateComponent;
  let fixture: ComponentFixture<EucharistUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EucharistUpdateComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EucharistUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
