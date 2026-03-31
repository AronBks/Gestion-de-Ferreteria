import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPICardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KPICardComponent],
  template: `
    <div class="dashboard">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Visión general del negocio — Estado actual de la ferretería</p>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <section class="kpi-grid">
        <app-kpi-card
          title="Total Productos"
          value="347"
          icon="📦"
          color="primary"
          [trend]="{ value: 12, isPositive: true, label: 'del mes' }">
        </app-kpi-card>

        <app-kpi-card
          title="Ventas del Mes"
          value="Bs. 25,430"
          icon="🛒"
          color="success"
          [trend]="{ value: 23, isPositive: true, label: 'vs. mes anterior' }">
        </app-kpi-card>

        <app-kpi-card
          title="Stock Crítico"
          value="12"
          icon="⚠️"
          color="danger"
          [trend]="{ value: 5, isPositive: false, label: 'nuevos alertas' }">
        </app-kpi-card>

        <app-kpi-card
          title="Ganancia Total"
          value="Bs. 8,643"
          icon="📈"
          color="warning"
          [trend]="{ value: 18, isPositive: true, label: 'margen promedio' }">
        </app-kpi-card>
      </section>

      <!-- Charts Row -->
      <section class="charts-row">
        <!-- Ventas Chart -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>Ventas por Semana</h3>
            <p class="text-secondary">Últimas 4 semanas</p>
          </div>
          <div class="chart-placeholder">
            <div class="chart-bar-container">
              <div class="chart-bar" style="height: 60%;"></div>
              <div class="chart-bar" style="height: 75%;"></div>
              <div class="chart-bar" style="height: 80%;"></div>
              <div class="chart-bar" style="height: 90%;"></div>
            </div>
            <p class="chart-label">Sem 1  Sem 2  Sem 3  Sem 4</p>
          </div>
        </div>

        <!-- Top Products -->
        <div class="top-products">
          <div class="chart-header">
            <h3>Productos Más Vendidos</h3>
            <p class="text-secondary">Top 5 productos</p>
          </div>
          <div class="products-list">
            <div class="product-item" *ngFor="let product of topProducts">
              <div class="product-info">
                <p class="product-name">{{ product.name }}</p>
                <p class="product-sales">{{ product.sales }} vendidos</p>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="product.progress"></div>
              </div>
              <span class="product-percent">{{ product.progress }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Sales Table -->
      <section class="recent-sales">
        <div class="table-header">
          <h3>Últimas Ventas</h3>
          <a href="#" class="see-all">Ver todas</a>
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
              <tr *ngFor="let sale of recentSales">
                <td><span class="sale-id">{{ sale.id }}</span></td>
                <td>{{ sale.customer }}</td>
                <td><span class="amount">Bs. {{ sale.amount }}</span></td>
                <td>{{ sale.date }}</td>
                <td>
                  <span [ngClass]="'status status-' + sale.status.toLowerCase().replace(' ', '-')">
                    {{ sale.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Critical Stock Section -->
      <section class="critical-stock">
        <div class="card-header">
          <h3>Stock Crítico - Requiere Reorden</h3>
          <button class="btn-action">Crear Orden de Compra</button>
        </div>
        <div class="stock-items">
          <div class="stock-item" *ngFor="let item of criticalStock">
            <span class="text-danger" style="font-size: 24px;">⚠️</span>
            <div class="stock-info">
              <p class="stock-name">{{ item.name }}</p>
              <p class="stock-code">{{ item.code }}</p>
            </div>
            <span class="quantity-badge">{{ item.stock }} unidad{{ item.stock !== 1 ? 'es' : '' }}</span>
            <button class="btn-reorder">Reordenar</button>
          </div>
        </div>
      </section>
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
      margin-bottom: var(--spacing-xl);
      animation: fadeInUp 0.4s ease-out;
    }

    .page-header h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font: var(--font-display-lg);
      color: var(--color-text-primary);
    }

    .subtitle {
      margin: 0;
      font: var(--font-body-md);
      color: var(--color-text-secondary);
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
    }

    .chart-bar {
      flex: 1;
      background: linear-gradient(180deg, var(--color-accent-primary), rgba(245, 158, 11, 0.5));
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .chart-bar:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .chart-label {
      text-align: center;
      font: var(--font-body-sm);
      color: var(--color-text-secondary);
      margin: 0;
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
      transition: width var(--transition-base);
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

    /* ========== CRITICAL STOCK SECTION ========== */
    .critical-stock {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      animation: fadeInUp 0.3s ease-out 0.3s both;
      transition: all var(--transition-base);

      /* Card Header */
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        flex-wrap: wrap;
        gap: var(--spacing-md);

        h3 {
          font: var(--font-display-sm);
          color: var(--color-text-primary);
          margin: 0;
          flex: 1;
          min-width: 250px;
        }
      }

      /* Stock Items Grid Container */
      .stock-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        width: 100%;

        /* Individual Stock Item Card */
        .stock-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background-color: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          min-height: 80px;
          flex-wrap: nowrap;

          /* Hover State */
          &:hover {
            border-color: var(--color-accent-primary);
            background-color: var(--color-bg-secondary, var(--color-bg-tertiary));
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
            transform: translateY(-2px);
          }

          /* Alert Icon */
          > span:first-child {
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 32px;
            line-height: 1;
          }

          /* Stock Info Section */
          .stock-info {
            flex: 1;
            min-width: 0; /* Critical for text truncation */
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);

            .stock-name {
              font: 600 0.95rem / 1.2 var(--font-family-body);
              color: var(--color-text-primary);
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .stock-code {
              font: 400 0.78rem / 1.4 var(--font-family-mono);
              color: var(--color-text-secondary);
              margin: 0;
              opacity: 0.75;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          /* Quantity Badge */
          .quantity-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            background-color: rgba(239, 68, 68, 0.12);
            color: var(--color-danger);
            border-radius: var(--radius-full);
            font: 600 0.8rem / 1 var(--font-family-body);
            white-space: nowrap;
            flex-shrink: 0;
          }

          /* Reorder Button */
          .btn-reorder {
            padding: 8px 14px;
            background-color: transparent;
            color: var(--color-accent-secondary);
            border: 1.5px solid var(--color-accent-secondary);
            border-radius: var(--radius-md);
            font: 600 0.85rem / 1 var(--font-family-body);
            cursor: pointer;
            transition: all var(--transition-base);
            white-space: nowrap;
            flex-shrink: 0;
            user-select: none;

            &:hover {
              background-color: var(--color-accent-secondary);
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
            }

            &:active {
              transform: translateY(0px);
            }
          }
        }
      }
    }

    .btn-action {
      padding: 10px 18px;
      background-color: var(--color-accent-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font: 600 0.9rem / 1 var(--font-family-body);
      cursor: pointer;
      transition: all var(--transition-base);
      white-space: nowrap;
      user-select: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
      }

      &:active {
        transform: translateY(0px);
      }
    }

    /* ========== RESPONSIVE DESIGN ========== */
    @media (max-width: 1200px) {
      .critical-stock {
        .stock-items {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
      }
    }

    @media (max-width: 992px) {
      .critical-stock {
        .stock-items {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .card-header {
          flex-direction: column;
          align-items: flex-start;

          h3 {
            min-width: unset;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .critical-stock {
        padding: var(--spacing-md);

        .card-header {
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          margin-bottom: var(--spacing-md);

          h3 {
            flex: unset;
            min-width: unset;
            margin-bottom: var(--spacing-sm);
          }
        }

        .stock-items {
          grid-template-columns: 1fr;
          gap: 1rem;

          .stock-item {
            min-height: auto;
            padding: var(--spacing-md);
            gap: var(--spacing-sm);

            > span:first-child {
              font-size: 24px;
              min-width: 28px;
            }

            .quantity-badge {
              padding: 4px 10px;
              font-size: 0.75rem;
            }

            .btn-reorder {
              padding: 6px 12px;
              font-size: 0.8rem;
            }
          }
        }
      }

      .btn-action {
        width: 100%;
        padding: 10px 16px;
      }
    }

    @media (max-width: 480px) {
      .critical-stock {
        padding: var(--spacing-md);

        .stock-items {
          grid-template-columns: 1fr;
          gap: 0.75rem;

          .stock-item {
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            min-height: auto;
            padding: var(--spacing-md);

            > span:first-child {
              align-self: flex-start;
              margin-bottom: var(--spacing-xs);
            }

            .stock-info {
              width: 100%;
              margin-bottom: var(--spacing-xs);
            }

            .quantity-badge,
            .btn-reorder {
              width: 100%;
              justify-content: center;
              text-align: center;
            }
          }
        }
      }

      .btn-action {
        width: 100%;
      }
    }

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

    .text-danger {
      color: var(--color-danger);
    }

    .text-secondary {
      color: var(--color-text-secondary);
    }

    @media (max-width: 1200px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .sales-table {
        font-size: 0.85rem;
      }

      .sales-table td,
      .sales-table th {
        padding: var(--spacing-sm);
      }

      .chart-placeholder {
        height: 250px;
      }

      .chart-bar-container {
        height: 200px;
      }

      .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }
    }

    @media (max-width: 480px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  topProducts = [
    { name: 'Tubo PVC 1"', sales: 245, progress: 100 },
    { name: 'Tornillos Acero', sales: 198, progress: 81 },
    { name: 'Brocha 2"', sales: 156, progress: 64 },
    { name: 'Cable Cobre', sales: 142, progress: 58 },
    { name: 'Cemento Gris', sales: 128, progress: 52 }
  ];

  recentSales = [
    { id: 'V-0847', customer: 'Juan García', amount: 450.50, date: '30/03/2026', status: 'Completada' },
    { id: 'V-0846', customer: 'María López', amount: 1200.00, date: '30/03/2026', status: 'Completada' },
    { id: 'V-0845', customer: 'Carlos Méndez', amount: 320.75, date: '29/03/2026', status: 'Pendiente' },
    { id: 'V-0844', customer: 'Ana Rodríguez', amount: 890.25, date: '29/03/2026', status: 'Completada' },
    { id: 'V-0843', customer: 'Pedro Castillo', amount: 150.00, date: '28/03/2026', status: 'Cancelada' }
  ];

  criticalStock = [
    { name: 'Pernos M6', code: 'HW-0221', stock: 8 },
    { name: 'Tuercas 1/2"', code: 'HW-0445', stock: 15 },
    { name: 'Arandelas Acero', code: 'HW-0556', stock: 12 }
  ];

  ngOnInit(): void {
    // Initialize dashboard
  }
}
