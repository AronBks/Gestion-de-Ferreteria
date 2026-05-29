import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { KPICardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ReportesService } from '../reportes/services/reportes.service';
import { DashboardResponse } from '../reportes/models/reportes.model';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  txns: number;
  dateLabel: string;
  fullDate: string;
}

interface GridLine {
  y: number;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KPICardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private reportesService = inject(ReportesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private elRef = inject(ElementRef);

  stats?: DashboardResponse;
  loading = true;
  error = false;
  errorMessage = '';
  diasFiltro = 30;

  // Period selector
  periods = [
    { label: '7 días', value: 7 },
    { label: '15 días', value: 15 },
    { label: '30 días', value: 30 }
  ];

  // Chart dimensions
  chartW = 700;
  chartH = 280;
  chartPad = 50;

  // Chart computed data
  chartPoints: ChartPoint[] = [];
  linePath = '';
  areaPath = '';
  gridLines: GridLine[] = [];
  labelStep = 1;
  chartTooltip: { x: number; y: number; date: string; value: number; txns: number } | null = null;

  // Sparkline data for KPI cards
  sparkSales: number[] = [];
  sparkRevenue: number[] = [];
  sparkProducts: number[] = [];

  private refreshTimer: any;

  ngOnInit(): void {
    this.loadDashboardData();
    // Auto-refresh every 5 minutes
    this.refreshTimer = setInterval(() => this.loadDashboardData(), 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;

    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'El servidor no responde. Verifica que el backend esté corriendo.';
        this.cdr.detectChanges();
      }
    }, 10000);

    this.reportesService.getDashboard(this.diasFiltro).subscribe({
      next: (data) => {
        clearTimeout(safetyTimeout);
        this.zone.run(() => {
          this.stats = data;
          this.loading = false;
          this.error = false;
          this.buildChart();
          this.buildSparklines();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        clearTimeout(safetyTimeout);
        this.zone.run(() => {
          this.error = true;
          this.errorMessage = 'Error de conexión con el servidor.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  changePeriod(dias: number): void {
    if (this.diasFiltro === dias) return;
    this.diasFiltro = dias;
    this.loadDashboardData();
  }

  // ==================== CHART LOGIC ====================

  buildChart(): void {
    if (!this.stats || !this.stats.ventasPorDia || this.stats.ventasPorDia.length === 0) {
      this.chartPoints = [];
      this.linePath = '';
      this.areaPath = '';
      this.gridLines = [];
      return;
    }

    const data = this.stats.ventasPorDia;
    const padL = this.chartPad;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const w = this.chartW;
    const h = this.chartH;

    const usableW = w - padL - padR;
    const usableH = h - padT - padB;

    const values = data.map(d => d.total);
    const maxVal = Math.max(...values, 1);
    const step = data.length > 1 ? usableW / (data.length - 1) : usableW;

    // Build points
    this.chartPoints = data.map((d, i) => {
      const x = padL + (data.length > 1 ? i * step : usableW / 2);
      const y = padT + (1 - d.total / maxVal) * usableH;
      const dateObj = new Date(d.fecha + 'T00:00:00');
      return {
        x, y,
        value: d.total,
        txns: d.transacciones,
        dateLabel: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        fullDate: dateObj.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
      };
    });

    // Label step (avoid overlap)
    this.labelStep = data.length > 14 ? 3 : data.length > 7 ? 2 : 1;

    // Build line path
    this.linePath = this.chartPoints.map((p, i) =>
      `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    ).join(' ');

    // Build area path
    const lastPt = this.chartPoints[this.chartPoints.length - 1];
    const firstPt = this.chartPoints[0];
    const bottomY = padT + usableH;
    this.areaPath = `${this.linePath} L${lastPt.x.toFixed(1)},${bottomY} L${firstPt.x.toFixed(1)},${bottomY} Z`;

    // Grid lines (4 lines)
    this.gridLines = [];
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4;
      const y = padT + frac * usableH;
      const val = maxVal * (1 - frac);
      this.gridLines.push({
        y,
        label: val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)
      });
    }
  }

  buildSparklines(): void {
    if (!this.stats || !this.stats.ventasPorDia) return;
    const last7 = this.stats.ventasPorDia.slice(-7);
    this.sparkSales = last7.map(d => d.total);
    this.sparkRevenue = last7.map((d, i) => {
      // Cumulative sum for revenue sparkline
      return last7.slice(0, i + 1).reduce((acc, v) => acc + v.total, 0);
    });
    this.sparkProducts = last7.map(d => d.transacciones);
  }

  onChartHover(event: MouseEvent): void {
    if (!this.chartPoints.length) return;
    const svg = (event.target as Element).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = this.chartW / rect.width;
    const mouseX = (event.clientX - rect.left) * scaleX;

    // Find closest point
    let closest = this.chartPoints[0];
    let minDist = Infinity;
    for (const pt of this.chartPoints) {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = pt;
      }
    }

    // Convert back to pixel coordinates relative to container
    const pixelX = closest.x / scaleX;
    const scaleY = this.chartH / rect.height;
    const pixelY = closest.y / scaleY;

    this.chartTooltip = {
      x: pixelX,
      y: pixelY,
      date: closest.fullDate,
      value: closest.value,
      txns: closest.txns
    };
  }

  getProductProgress(cantidad: number): number {
    if (!this.stats || this.stats.topProductos.length === 0) return 0;
    const max = this.stats.topProductos[0].cantidadVendida;
    return max > 0 ? (cantidad / max) * 100 : 0;
  }

  getBarHeight(value: number): number {
    if (!this.stats || this.stats.ventasPorDia.length === 0) return 0;
    const max = Math.max(...this.stats.ventasPorDia.map(v => v.total));
    return max > 0 ? (value / max) * 100 : 0;
  }
}
