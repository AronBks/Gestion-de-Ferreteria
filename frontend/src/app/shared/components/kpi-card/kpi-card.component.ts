import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KPIData {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card" [class]="'color-' + color">
      <div class="kpi-header">
        <div class="kpi-icon">
          {{ icon }}
        </div>
        <div class="kpi-trend" *ngIf="trend" [class.positive]="trend.isPositive">
          <span class="trend-icon">{{ trend.isPositive ? '📈' : '📉' }}</span>
          <span>{{ trend.value }}% {{ trend.label }}</span>
        </div>
      </div>

      <div class="kpi-content">
        <h3 class="kpi-value">{{ value }}</h3>
        <p class="kpi-title">{{ title }}</p>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
      animation: fadeInUp 0.3s ease-out;
    }

    .kpi-card:hover {
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 1px var(--color-accent-primary), 0 4px 12px rgba(245, 158, 11, 0.1);
    }

    /* Color Variants */
    .kpi-card.color-primary .kpi-icon {
      background-color: #FEF3C7;
      color: var(--color-accent-primary);
    }

    .kpi-card.color-success .kpi-icon {
      background-color: #D1FAE5;
      color: var(--color-success);
    }

    .kpi-card.color-danger .kpi-icon {
      background-color: #FEE2E2;
      color: var(--color-danger);
    }

    .kpi-card.color-warning .kpi-icon {
      background-color: #FEF3C7;
      color: var(--color-accent-primary);
    }

    .kpi-card.color-info .kpi-icon {
      background-color: #DBEAFE;
      color: var(--color-accent-secondary);
    }

    /* In dark mode, adjust backgrounds */
    html[data-theme="dark"] .kpi-card.color-primary .kpi-icon {
      background-color: rgba(245, 158, 11, 0.15);
      color: #FCD34D;
    }

    html[data-theme="dark"] .kpi-card.color-success .kpi-icon {
      background-color: rgba(16, 185, 129, 0.15);
      color: #6EE7B7;
    }

    html[data-theme="dark"] .kpi-card.color-danger .kpi-icon {
      background-color: rgba(239, 68, 68, 0.15);
      color: #FCA5A5;
    }

    html[data-theme="dark"] .kpi-card.color-info .kpi-icon {
      background-color: rgba(59, 130, 246, 0.15);
      color: #93C5FD;
    }

    /* Header */
    .kpi-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 28px;
      line-height: 1;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--color-success);
      padding: 4px 8px;
      background-color: rgba(16, 185, 129, 0.1);
      border-radius: var(--radius-md);
    }

    .trend-icon {
      font-size: 14px;
      line-height: 1;
    }

    .kpi-trend.positive {
      color: var(--color-success);
      background-color: rgba(16, 185, 129, 0.1);
    }

    .kpi-trend:not(.positive) {
      color: var(--color-danger);
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* Content */
    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .kpi-value {
      font-weight: 700;
      font-size: 2rem;
      line-height: 1.2;
      color: var(--color-text-primary);
      margin: 0;
      font-family: var(--font-family-display);
    }

    .kpi-title {
      font-weight: 400;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--color-text-secondary);
      margin: 0;
      font-family: var(--font-family-body);
    }

    /* Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .kpi-card {
        padding: var(--spacing-md);
      }

      .kpi-value {
        font-size: 1.75rem;
      }
    }
  `]
})
export class KPICardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() trend?: { value: number; isPositive: boolean; label: string };
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
}
  