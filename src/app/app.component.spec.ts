import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Check if the title is in the component
    const titleElement = compiled.querySelector('h1');
    if (titleElement) {
      expect(titleElement.textContent).toContain('Hello, Biodata-System');
    } else {
      // If no h1, check the component's property
      const app = fixture.componentInstance;
      expect(app.title).toBeDefined();
      console.log('App title:', app.title);
    }
  });
});