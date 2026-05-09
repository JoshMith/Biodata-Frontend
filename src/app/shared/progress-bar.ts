// progress-bar.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-track">
        <div
          class="progress-step"
          *ngFor="let step of steps; let i = index"
          [class.active]="i === currentStep"
          [class.completed]="i < currentStep"
          [class.clickable]="isClickable(i)"
          (click)="navigateToStep(i)"
          [attr.title]="getStepTooltip(i)"
        >
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
        <div class="progress-line" [style.width]="calculateProgress()"></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      margin: 30px 0;
      padding: 0 10px;
    }

    .progress-track {
      display: flex;
      justify-content: space-between;
      position: relative;
    }

    .progress-track::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #ddd;
      z-index: 0;
    }

    .progress-line {
      position: absolute;
      top: 15px;
      left: 0;
      height: 4px;
      background-color: #6d5507;
      z-index: 1;
      transition: width 0.3s ease;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
      transition: transform 0.15s ease;
    }

    .progress-step.clickable {
      cursor: pointer;
    }

    .progress-step.clickable:hover .step-number {
      transform: scale(1.12);
      box-shadow: 0 0 0 4px rgba(109, 85, 7, 0.18);
    }

    .progress-step.clickable:hover .step-label {
      color: #6d5507;
    }

    .step-number {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: #ddd;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      margin-bottom: 8px;
      color: white;
      border: 2px solid white;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease;
    }

    .step-label {
      font-size: 12px;
      text-align: center;
      max-width: 80px;
      color: #888;
      transition: color 0.15s ease;
    }

    .completed .step-number {
      background-color: #6d5507;
    }

    .active .step-number {
      background-color: #C2AE6D;
      box-shadow: 0 0 0 3px rgba(109, 85, 7, 0.2);
    }

    .active .step-label {
      color: #4A002A;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .step-label {
        font-size: 10px;
      }
    }
  `]
})
export class ProgressBarComponent implements OnInit {
  /** 0-based index of the currently active step */
  @Input() currentStep: number = 0;

  /**
   * Controls which route set to use when a step is clicked.
   * - 'form'  → /personal-info, /baptism, /eucharist, /confirmation, /marriage
   * - 'edit'  → /edit-personal-info, /edit-baptism, /edit-eucharist,
   *              /edit-confirmation, /edit-marriage
   *
   * Defaults to auto-detection from the current URL so existing usages
   * that don't pass the input still work correctly.
   */
  @Input() mode: 'form' | 'edit' | 'auto' = 'auto';

  steps = ['Personal Info', 'Baptism', 'Eucharist', 'Confirmation', 'Marriage'];

  private formRoutes  = ['/personal-info', '/baptism', '/eucharist', '/confirmation', '/marriage'];
  private editRoutes  = ['/edit-personal-info', '/edit-baptism', '/edit-eucharist', '/edit-confirmation', '/edit-marriage'];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  /** Resolve the active mode, falling back to URL inspection when 'auto'. */
  private resolvedMode(): 'form' | 'edit' {
    if (this.mode !== 'auto') return this.mode;
    const url = this.router.url;
    return url.startsWith('/edit-') ? 'edit' : 'form';
  }

  private routes(): string[] {
    return this.resolvedMode() === 'edit' ? this.editRoutes : this.formRoutes;
  }

  /**
   * A step is clickable when it is NOT the currently active step.
   * You can tighten this (e.g. only completed steps) if needed.
   */
  isClickable(stepIndex: number): boolean {
    return stepIndex !== this.currentStep;
  }

  getStepTooltip(stepIndex: number): string {
    if (stepIndex === this.currentStep) return '';
    return `Go to ${this.steps[stepIndex]}`;
  }

  navigateToStep(stepIndex: number): void {
    if (!this.isClickable(stepIndex)) return;

    const targetRoute = this.routes()[stepIndex];

    if (this.resolvedMode() === 'edit') {
      // Preserve the ?id= query param used by every edit component
      const currentId = this.getQueryParamId();
      if (currentId) {
        this.router.navigate([targetRoute], { queryParams: { id: currentId } });
      } else {
        // Fallback: try reading from selectedChristian in localStorage
        const stored = localStorage.getItem('selectedChristian');
        const id = stored ? JSON.parse(stored)?.id : null;
        if (id) {
          this.router.navigate([targetRoute], { queryParams: { id } });
        } else {
          this.router.navigate([targetRoute]);
        }
      }
    } else {
      this.router.navigate([targetRoute]);
    }
  }

  // ------------------------------------------------------------------
  // URL helpers
  // ------------------------------------------------------------------

  private getQueryParamId(): string | null {
    const match = this.router.url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  }

  calculateProgress(): string {
    if (this.currentStep === 0) return '0%';
    const segmentWidth = 100 / (this.steps.length - 1);
    return `${this.currentStep * segmentWidth}%`;
  }
}