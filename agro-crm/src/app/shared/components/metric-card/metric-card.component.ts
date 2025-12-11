import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card [styleClass]="'metric-card ' + variant">
      <div class="metric-content">
        <div class="metric-icon" *ngIf="icon">
          <i [class]="icon"></i>
        </div>
        <div class="metric-data">
          <span class="metric-label">{{ label }}</span>
          <span class="metric-value">{{ value }}</span>
          <span class="metric-trend" *ngIf="trend" [class.positive]="trend > 0" [class.negative]="trend < 0">
            <i [class]="trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
            {{ Math.abs(trend) }}%
          </span>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .metric-card {
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .metric-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: var(--gray-100);
      color: var(--gray-600);
    }

    .metric-data {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .metric-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.25rem;
    }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1;
    }

    .metric-trend {
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-trend.positive {
      color: #10B981;
    }

    .metric-trend.negative {
      color: #EF4444;
    }

    .metric-card.primary .metric-icon {
      background: var(--gray-100);
      color: var(--primary-600);
    }

    .metric-card.success .metric-icon {
      background: var(--gray-100);
      color: var(--primary-600);
    }

    .metric-card.warning .metric-icon {
      background: var(--gray-100);
      color: var(--gray-600);
    }

    .metric-card.danger .metric-icon {
      background: var(--gray-100);
      color: var(--gray-600);
    }
  `]
})
export class MetricCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon?: string;
  @Input() trend?: number;
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  Math = Math;
}

