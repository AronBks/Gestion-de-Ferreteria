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
      <!-- Sparkline Background -->
      <svg *ngIf="sparklineData && sparklineData.length > 1"
           class="sparkline-bg"
           viewBox="0 0 200 60"
           preserveAspectRatio="none">
        <defs>
          <linearGradient [attr.id]="'spark-grad-' + color" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="getSparkColor()" stop-opacity="0.3"/>
            <stop offset="100%" [attr.stop-color]="getSparkColor()" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path [attr.d]="getSparklineAreaPath()" [attr.fill]="'url(#spark-grad-' + color + ')'" />
        <path [attr.d]="getSparklinePath()" fill="none" [attr.stroke]="getSparkColor()" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <div class="kpi-top">
        <div class="kpi-icon-wrap">
          <span class="kpi-icon" [innerHTML]="getSvgIcon()"></span>
        </div>
        <div class="kpi-trend" *ngIf="trend" [class.positive]="trend.isPositive" [class.negative]="!trend.isPositive">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path *ngIf="trend.isPositive" d="M6 2L10 7H2L6 2Z" fill="currentColor"/>
            <path *ngIf="!trend.isPositive" d="M6 10L2 5H10L6 10Z" fill="currentColor"/>
          </svg>
          <span>{{ trend.value >= 0 ? '+' : '' }}{{ trend.value }}%</span>
        </div>
      </div>

      <div class="kpi-bottom">
        <h3 class="kpi-value">{{ value }}</h3>
        <p class="kpi-title">{{ title }}</p>
        <p class="kpi-label" *ngIf="trend">{{ trend.label }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .kpi-card {
      position: relative;
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
      animation: kpiEnter 0.5s ease-out both;
      overflow: hidden;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -4px rgba(0,0,0,0.15);
    }

    .kpi-card:hover .sparkline-bg {
      opacity: 0.8;
    }

    /* Sparkline background */
    .sparkline-bg {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 55%;
      opacity: 0.5;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    /* Color border accents */
    .color-primary { border-bottom: 3px solid #F59E0B; }
    .color-success { border-bottom: 3px solid #10B981; }
    .color-danger  { border-bottom: 3px solid #EF4444; }
    .color-warning { border-bottom: 3px solid #F59E0B; }
    .color-info    { border-bottom: 3px solid #3B82F6; }

    .color-primary:hover { border-color: #F59E0B; }
    .color-success:hover { border-color: #10B981; }
    .color-danger:hover  { border-color: #EF4444; }
    .color-warning:hover { border-color: #F59E0B; }
    .color-info:hover    { border-color: #3B82F6; }

    /* Icon styling */
    .kpi-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 300ms ease;
    }

    .color-primary .kpi-icon-wrap { background: rgba(245, 158, 11, 0.12); }
    .color-success .kpi-icon-wrap { background: rgba(16, 185, 129, 0.12); }
    .color-danger .kpi-icon-wrap  { background: rgba(239, 68, 68, 0.12); }
    .color-warning .kpi-icon-wrap { background: rgba(245, 158, 11, 0.12); }
    .color-info .kpi-icon-wrap    { background: rgba(59, 130, 246, 0.12); }

    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon :host ::ng-deep svg {
      width: 22px;
      height: 22px;
    }

    .color-primary .kpi-icon { color: #F59E0B; }
    .color-success .kpi-icon { color: #10B981; }
    .color-danger .kpi-icon  { color: #EF4444; }
    .color-warning .kpi-icon { color: #F59E0B; }
    .color-info .kpi-icon    { color: #3B82F6; }

    /* Trend badge */
    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 0.75rem;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 20px;
    }

    .kpi-trend.positive {
      color: #10B981;
      background-color: rgba(16, 185, 129, 0.1);
    }

    .kpi-trend.negative {
      color: #EF4444;
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* Bottom content */
    .kpi-bottom {
      display: flex;
      flex-direction: column;
      gap: 2px;
      position: relative;
      z-index: 1;
    }

    .kpi-value {
      font-weight: 700;
      font-size: 1.85rem;
      line-height: 1.1;
      color: var(--color-text-primary);
      margin: 0;
      font-family: var(--font-family-display);
      letter-spacing: -0.02em;
    }

    .kpi-title {
      font-weight: 500;
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--color-text-secondary);
      margin: 0;
      font-family: var(--font-family-body);
    }

    .kpi-label {
      font-size: 0.72rem;
      color: var(--color-text-tertiary);
      margin: 2px 0 0 0;
      font-family: var(--font-family-body);
    }

    /* Animation */
    @keyframes kpiEnter {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .kpi-card {
        padding: 16px;
      }
      .kpi-value {
        font-size: 1.5rem;
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
  @Input() sparklineData?: number[];

  getSparkColor(): string {
    const colors: Record<string, string> = {
      primary: '#F59E0B',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    };
    return colors[this.color] || '#F59E0B';
  }

  getSparklinePath(): string {
    if (!this.sparklineData || this.sparklineData.length < 2) return '';
    const data = this.sparklineData;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 200;
    const h = 55;
    const padding = 5;
    const step = w / (data.length - 1);

    return data.map((val, i) => {
      const x = i * step;
      const y = padding + (1 - (val - min) / range) * (h - padding * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getSparklineAreaPath(): string {
    if (!this.sparklineData || this.sparklineData.length < 2) return '';
    const linePath = this.getSparklinePath();
    const data = this.sparklineData;
    const w = 200;
    const lastX = (data.length - 1) * (w / (data.length - 1));
    return `${linePath} L${lastX},60 L0,60 Z`;
  }

  getSvgIcon(): string {
    const icons: Record<string, string> = {
      'productos': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      'ventas': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      'stock': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      'ingresos': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      'ticket': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      'transacciones': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    };
    return icons[this.icon] || icons['productos'];
  }
}