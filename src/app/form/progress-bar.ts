// progress-bar.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-track">
        <div class="progress-step" *ngFor="let step of steps; let i = index" 
             [class.active]="i === currentStep" 
             [class.completed]="i < currentStep">
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
    }
    
    .step-label {
      font-size: 12px;
      text-align: center;
      max-width: 80px;
      color: #888;
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
export class ProgressBarComponent {
  @Input() currentStep: number = 0;
  steps = [
    'Personal Info',
    'Baptism',
    'Eucharist',
    'Confirmation',
    'Marriage'
  ];

  calculateProgress(): string {
    if (this.currentStep === 0) return '0%';
    const segmentWidth = 100 / (this.steps.length - 1);
    return `${this.currentStep * segmentWidth}%`;
  }
}