import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { KPICardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ReportesService } from '../reportes/services/reportes.service';
import { DashboardResponse, RecentSale, CriticalStockItem, TopProductoStatus } from '../reportes/models/reportes.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KPICardComponent],
  template: `
    <div class="dashboard">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Visión general del negocio — Estado actual de la ferretería</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" routerLink="/dashboard/ventas/nueva">
            <span>+</span> Nueva Venta
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loader"></div>
        <p>Cargando datos del dashboard...</p>
      </div>

      <ng-container *ngIf="!loading && !error && stats">
        <!-- KPI Cards Grid -->
        <section class="kpi-grid">
          <app-kpi-card
            title="Total Productos"
            [value]="stats.kpis.totalProductos.toString()"
            icon="📦"
            color="primary"
            [trend]="{ value: 0, isPositive: true, label: 'en inventario' }">
          </app-kpi-card>

          <app-kpi-card
            title="Ventas del Mes"
            [value]="'Bs. ' + stats.kpis.ventasMes.toLocaleString()"
            icon="🛒"
            color="success"
            [trend]="{ value: stats.kpis.trendVentas, isPositive: stats.kpis.trendVentas >= 0, label: 'vs. mes anterior' }">
          </app-kpi-card>

          <app-kpi-card
            title="Stock Crítico"
            [value]="stats.kpis.stockCriticoCount.toString()"
            icon="⚠️"
            color="danger"
            [trend]="{ value: stats.kpis.stockCriticoCount, isPositive: false, label: 'requieren atención' }">
          </app-kpi-card>

          <app-kpi-card
            title="Ingresos Totales"
            [value]="'Bs. ' + stats.kpis.ingresosTotales.toLocaleString()"
            icon="📈"
            color="warning"
            [trend]="{ value: 0, isPositive: true, label: 'acumulado' }">
          </app-kpi-card>
        </section>

        <!-- Charts Row -->
        <section class="charts-row">
          <!-- Ventas Chart -->
          <div class="chart-container">
            <div class="chart-header">
              <h3>Ventas por Día</h3>
              <p class="text-secondary">Últimos {{ diasFiltro }} días</p>
            </div>
            <div class="chart-placeholder">
              <div class="chart-bar-container">
                <div *ngFor="let dia of stats.ventasPorDia.slice(-7)" 
                     class="chart-bar-wrapper" 
                     [attr.data-label]="dia.fecha | date:'dd/MM'">
                  <div class="chart-bar" [style.height.%]="getBarHeight(dia.total)">
                    <span class="bar-value">Bs. {{ dia.total | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
              <p class="chart-label">Tendencia de ingresos semanales</p>
            </div>
          </div>

          <!-- Top Products -->
          <div class="top-products">
            <div class="chart-header">
              <h3>Productos Más Vendidos</h3>
              <p class="text-secondary">Top 5 por cantidad</p>
            </div>
            <div class="products-list">
              <div class="product-item" *ngFor="let product of stats.topProductos">
                <div class="product-info">
                  <p class="product-name">{{ product.nombre }}</p>
                  <p class="product-sales">{{ product.cantidadVendida }} vendidos</p>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getProductProgress(product.cantidadVendida)"></div>
                </div>
                <span class="product-percent">{{ product.cantidadVendida }}</span>
              </div>
              <div *ngIf="stats.topProductos.length === 0" class="empty-state">
                No hay datos de ventas en este periodo.
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Sales Table -->
        <section class="recent-sales">
          <div class="table-header">
            <h3>Últimas Ventas</h3>
            <a routerLink="/dashboard/ventas" class="see-all">Ver todas</a>
          </div>
          <div style="overflow-x: auto;">
            <table class="sales-table">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sale of stats.recentSales" [routerLink]="['/dashboard/ventas', sale.realId || sale.id]" style="cursor: pointer;">
                  <td><span class="sale-id">{{ sale.id }}</span></td>
                  <td>{{ sale.customer }}</td>
                  <td><span class="amount">Bs. {{ sale.amount | number:'1.2-2' }}</span></td>
                  <td>{{ sale.date }}</td>
                  <td>
                    <span [ngClass]="'status status-' + sale.status.toLowerCase()">
                      {{ sale.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="stats.recentSales.length === 0">
                  <td colspan="5" class="text-center">No se han registrado ventas recientemente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Critical Stock Section -->
        <section class="critical-stock">
          <div class="card-header">
            <h3>Stock Crítico - Requiere Reorden</h3>
            <button class="btn-action" routerLink="/dashboard/productos">Gestionar Inventario</button>
          </div>
          <div class="stock-items">
            <div class="stock-item" *ngFor="let item of stats.criticalStock">
              <span class="text-danger" style="font-size: 24px;">⚠️</span>
              <div class="stock-info">
                <p class="stock-name">{{ item.name }}</p>
                <p class="stock-code">{{ item.code }}</p>
              </div>
              <span class="quantity-badge">{{ item.stock }} unidad{{ item.stock !== 1 ? 'es' : '' }}</span>
              <button class="btn-reorder" routerLink="/dashboard/productos">Reordenar</button>
            </div>
            <div *ngIf="stats.criticalStock.length === 0" class="empty-state-full">
              <span class="text-success">✅</span> Todo el stock está en niveles óptimos.
            </div>
          </div>
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: var(--spacing-lg);
      background-color: var(--color-bg-primary);
      max-width: 100%;
      min-height: 100vh;
      transition: background-color var(--transition-base);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      animation: fadeInUp 0.4s ease-out;
    }

    .page-header h1 {
      margin: 0 0 var(--spacing-xs) 0;
      font: var(--font-display-lg);
      color: var(--color-text-primary);
    }

    .subtitle {
      margin: 0;
      font: var(--font-body-md);
      color: var(--color-text-secondary);
    }

    .btn-primary {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .chart-container,
    .top-products {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      animation: fadeInUp 0.3s ease-out 0.1s both;
      transition: all var(--transition-base);
    }

    .chart-header {
      margin-bottom: var(--spacing-lg);
    }

    .chart-header h3 {
      margin: 0 0 var(--spacing-xs) 0;
      font: var(--font-display-sm);
      color: var(--color-text-primary);
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: var(--spacing-md);
    }

    .chart-bar-container {
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-md);
      height: 250px;
      padding-top: 30px;
    }

    .chart-bar-wrapper {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;

      &::after {
        content: attr(data-label);
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
    }

    .chart-bar {
      width: 40px;
      margin: 0 auto;
      background: linear-gradient(180deg, var(--color-accent-primary), rgba(245, 158, 11, 0.3));
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      transition: height 1s ease-out;
      position: relative;
      cursor: pointer;

      &:hover {
        background: var(--color-accent-primary);
        .bar-value { opacity: 1; }
      }
    }

    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-primary);
      opacity: 0;
      transition: opacity 0.2s;
      white-space: nowrap;
    }

    .chart-label {
      text-align: center;
      font: var(--font-body-sm);
      color: var(--color-text-secondary);
      margin: 25px 0 0 0;
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      margin: 0;
      font: 600 0.95rem / 1.2 var(--font-family-body);
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-sales {
      margin: var(--spacing-xs) 0 0 0;
      font: var(--font-body-sm);
      color: var(--color-text-secondary);
    }

    .progress-bar {
      flex: 2;
      height: 6px;
      background-color: var(--color-bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
      border-radius: var(--radius-full);
      transition: width 1s ease-in-out;
    }

    .product-percent {
      font: 600 0.85rem / 1 var(--font-family-body);
      color: var(--color-text-secondary);
      min-width: 35px;
      text-align: right;
    }

    .recent-sales {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      animation: fadeInUp 0.3s ease-out 0.2s both;
      transition: all var(--transition-base);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .table-header h3 {
      font: var(--font-display-sm);
      color: var(--color-text-primary);
      margin: 0;
    }

    .see-all {
      color: var(--color-accent-primary);
      font-weight: 600;
      text-decoration: none;
      transition: color var(--transition-base);
    }

    .see-all:hover {
      color: var(--color-accent-secondary);
    }

    .sales-table {
      width: 100%;
      border-collapse: collapse;
    }

    .sales-table thead {
      background-color: var(--color-bg-tertiary);
    }

    .sales-table th {
      padding: var(--spacing-md);
      text-align: left;
      font: 600 0.8rem / 1.5 var(--font-family-body);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: none;
    }

    .sales-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      font: var(--font-body-md);
      color: var(--color-text-primary);
    }

    .sales-table tbody tr:hover {
      background-color: var(--color-bg-tertiary);
    }

    .sale-id {
      font-family: var(--font-family-mono);
      color: var(--color-accent-primary);
      font-weight: 600;
    }

    .amount {
      font-weight: 600;
      color: var(--color-success);
    }

    .status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font: 600 0.75rem / 1 var(--font-family-body);
      text-transform: capitalize;
    }

    .status-completada {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
    }

    .status-pendiente {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--color-warning);
    }

    .status-cancelada {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
    }

    .critical-stock {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      animation: fadeInUp 0.3s ease-out 0.3s both;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        h3 { font: var(--font-display-sm); margin: 0; }
      }

      .stock-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .stock-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--color-bg-tertiary);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        transition: all 0.2s;

        &:hover {
          border-color: var(--color-danger);
          transform: translateY(-2px);
        }
      }

      .stock-info { flex: 1; min-width: 0; }
      .stock-name { font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .stock-code { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0; }
      .quantity-badge {
        padding: 4px 12px;
        background: rgba(239, 68, 68, 0.1);
        color: var(--color-danger);
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.8rem;
      }
      .btn-reorder {
        padding: 6px 12px;
        background: transparent;
        border: 1px solid var(--color-accent-primary);
        color: var(--color-accent-primary);
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        &:hover { background: var(--color-accent-primary); color: white; }
      }
    }

    .error-state {
      height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 1rem;
      background: var(--color-card-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      animation: fadeInUp 0.3s ease-out;

      .error-icon { font-size: 3rem; }
      h3 { margin: 0; color: var(--color-text-primary); }
      p { color: var(--color-text-secondary); max-width: 400px; margin: 0; }
    }

    .btn-retry {
      padding: 10px 20px;
      background: var(--color-accent-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      &:hover { transform: scale(1.05); }
    }

    .loading-overlay {
      height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      gap: 1rem;
    }

    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-bg-tertiary);
      border-top-color: var(--color-accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      padding: 1rem;
      text-align: center;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .empty-state-full {
      grid-column: 1 / -1;
      padding: 2rem;
      text-align: center;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1200px) {
      .charts-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  stats?: DashboardResponse;
  loading = true;
  error = false;
  errorMessage = '';
  diasFiltro = 30;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;
    
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'El servidor no responde. Por favor, verifica que el backend esté corriendo.';
      }
    }, 10000);

    this.reportesService.getDashboard(this.diasFiltro).subscribe({
      next: (data) => {
        clearTimeout(safetyTimeout);
        this.zone.run(() => {
          this.stats = data;
          this.loading = false;
          this.error = false;
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

  getBarHeight(value: number): number {
    if (!this.stats || this.stats.ventasPorDia.length === 0) return 0;
    const max = Math.max(...this.stats.ventasPorDia.map(v => v.total));
    return max > 0 ? (value / max) * 100 : 0;
  }

  getProductProgress(cantidad: number): number {
    if (!this.stats || this.stats.topProductos.length === 0) return 0;
    const max = this.stats.topProductos[0].cantidadVendida;
    return max > 0 ? (cantidad / max) * 100 : 0;
  }
}
