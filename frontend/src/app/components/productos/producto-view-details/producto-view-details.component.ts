import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  costoBs: number;
  precioBs: number;
  ganancia: number;
  gananciaPercent: number;
  stock: number;
  estado: boolean;
}

@Component({
  selector: 'app-producto-view-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="modal-overlay" (click)="closeModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <h2>Detalles del Producto</h2>
            <p class="header-subtitle">Información completa del artículo</p>
          </div>
          <button class="close-btn" (click)="closeModal()" aria-label="Cerrar">
            <span>✕</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" *ngIf="producto">
          <!-- Product Header Info -->
          <div class="product-header">
            <div class="product-code-badge">
              <span class="emoji">📦</span>
              <span class="code">{{ producto.codigo }}</span>
            </div>
            <h3 class="product-title">{{ producto.nombre }}</h3>
            <div class="estado-badge" [class.activo]="producto.estado" [class.inactivo]="!producto.estado">
              <span class="status-dot"></span>
              {{ producto.estado ? 'Activo' : 'Inactivo' }}
            </div>
          </div>

          <!-- Description -->
          <div class="section">
            <label class="section-label">Descripción</label>
            <p class="description-text">{{ producto.descripcion || 'Sin descripción disponible' }}</p>
          </div>

          <!-- Pricing Section -->
          <div class="pricing-section">
            <div class="price-card cost">
              <div class="price-label">Costo Bs.</div>
              <div class="price-value">{{ producto.costoBs | number:'1.0-2' }}</div>
            </div>

            <div class="price-card selling">
              <div class="price-label">Precio Venta Bs.</div>
              <div class="price-value">{{ producto.precioBs | number:'1.0-2' }}</div>
            </div>

            <div class="price-card profit">
              <div class="price-label">Ganancia Bs.</div>
              <div class="price-value">{{ producto.ganancia | number:'1.0-2' }}</div>
              <div class="price-percentage">
                <span *ngIf="producto.gananciaPercent > 50">🔥</span>
                {{ producto.gananciaPercent | number:'1.0-0' }}%
              </div>
            </div>
          </div>

          <!-- Stock Section -->
          <div class="section">
            <label class="section-label">Estado del Stock</label>
            <div class="stock-container">
              <div class="stock-info">
                <span class="stock-label">Stock Disponible:</span>
                <span class="stock-value" [class]="getStockClass()">
                  {{ producto.stock }} unidades
                  <span *ngIf="producto.stock < 20" class="warning-icon">⚠️</span>
                </span>
              </div>
              <div class="stock-bar">
                <div class="stock-fill" [style.width.%]="getStockPercentage()"></div>
              </div>
              <div class="stock-status">
                <span [class]="getStockStatusClass()">{{ getStockStatus() }}</span>
              </div>
            </div>
          </div>

          <!-- Summary Grid -->
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Margen de Ganancia</span>
              <span class="summary-value highlight">{{ producto.gananciaPercent | number:'1.0-0' }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Rotación Estimada</span>
              <span class="summary-value">{{ getRotationLevel() }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn btn-primary" (click)="closeModal()">
            <span class="icon">✓</span>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-dialog {
      background: var(--color-card-bg);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }

    @keyframes slideUp {
      from {
        transform: translateY(40px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 32px 32px 24px;
      border-bottom: 1px solid var(--color-border);
      gap: 20px;
    }

    .header-content h2 {
      margin: 0 0 4px 0;
      font: 600 1.35rem / 1.4 var(--font-family-body);
      color: var(--color-text-primary);
    }

    .header-subtitle {
      margin: 0;
      font: 400 0.9rem / 1.4 var(--font-family-body);
      color: var(--color-text-secondary);
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
      font-size: 18px;
    }

    .close-btn:hover {
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
      border-color: var(--color-accent-primary);
    }

    /* Body */
    .modal-body {
      padding: 32px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Product Header */
    .product-header {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--color-border);
    }

    .product-code-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 8px 16px;
      background-color: rgba(245, 158, 11, 0.1);
      border-radius: var(--radius-md);
      font: 600 0.9rem / 1 var(--font-family-mono);
      color: var(--color-accent-primary);
    }

    .product-code-badge .emoji {
      font-size: 18px;
    }

    .product-title {
      margin: 0;
      font: 700 1.6rem / 1.3 var(--font-family-body);
      color: var(--color-text-primary);
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font: 500 0.85rem / 1 var(--font-family-body);
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
    }

    .estado-badge.inactivo {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    /* Sections */
    .section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-label {
      margin: 0;
      font: 600 0.9rem / 1.4 var(--font-family-body);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .description-text {
      margin: 0;
      font: 400 0.95rem / 1.6 var(--font-family-body);
      color: var(--color-text-primary);
      padding: 12px 16px;
      background-color: var(--color-bg-tertiary);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--color-accent-primary);
    }

    /* Pricing Section */
    .pricing-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .price-card {
      padding: 20px;
      border-radius: var(--radius-lg);
      border: 2px solid var(--color-border);
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .price-card.cost {
      background-color: rgba(245, 158, 11, 0.05);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .price-card.selling {
      background-color: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.2);
    }

    .price-card.profit {
      background-color: rgba(59, 130, 246, 0.05);
      border-color: rgba(59, 130, 246, 0.2);
    }

    .price-label {
      font: 400 0.8rem / 1.4 var(--font-family-body);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .price-value {
      font: 700 1.5rem / 1.3 var(--font-family-mono);
      color: var(--color-text-primary);
    }

    .price-percentage {
      font: 600 0.85rem / 1 var(--font-family-body);
      color: var(--color-info);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Stock Section */
    .stock-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      background-color: var(--color-bg-tertiary);
      border-radius: var(--radius-lg);
    }

    .stock-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .stock-label {
      font: 500 0.9rem / 1.4 var(--font-family-body);
      color: var(--color-text-secondary);
    }

    .stock-value {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font: 700 1rem / 1 var(--font-family-status);
      color: var(--color-success);
    }

    .stock-value.critical {
      color: var(--color-danger);
    }

    .warning-icon {
      font-size: 0.9rem;
    }

    .stock-bar {
      width: 100%;
      height: 8px;
      background-color: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }

    .stock-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-success), var(--color-accent-primary));
      transition: width 0.4s ease-out;
      border-radius: 4px;
    }

    .stock-status {
      display: flex;
      justify-content: space-between;
      font: 500 0.8rem / 1.4 var(--font-family-body);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stock-status span {
      color: var(--color-text-secondary);
    }

    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      padding: 20px;
      background-color: var(--color-bg-tertiary);
      border-radius: var(--radius-lg);
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-label {
      font: 500 0.8rem / 1.4 var(--font-family-body);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-value {
      font: 700 1.25rem / 1.3 var(--font-family-status);
      color: var(--color-text-primary);
    }

    .summary-value.highlight {
      color: var(--color-accent-primary);
    }

    /* Footer */
    .modal-footer {
      padding: 24px 32px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background-color: var(--color-bg-tertiary);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font: 600 0.95rem / 1 var(--font-family-body);
      border: none;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .btn-primary {
      background-color: var(--color-accent-primary);
      color: #000;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn .icon {
      font-size: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-dialog {
        max-width: 95%;
      }

      .modal-header {
        padding: 24px 20px 16px;
        flex-direction: column;
      }

      .close-btn {
        align-self: flex-end;
      }

      .modal-body {
        padding: 20px;
        gap: 20px;
      }

      .pricing-section {
        grid-template-columns: 1fr 1fr;
      }

      .modal-footer {
        padding: 16px 20px;
      }

      .product-title {
        font-size: 1.35rem;
      }
    }

    @media (max-width: 480px) {
      .modal-dialog {
        max-width: 100%;
        max-height: 100%;
        border-radius: var(--radius-lg);
      }

      .modal-header {
        padding: 20px 16px 12px;
      }

      .modal-body {
        padding: 16px;
        gap: 16px;
      }

      .pricing-section {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        padding: 12px 16px;
        gap: 8px;
      }

      .product-title {
        font-size: 1.15rem;
      }

      .price-value {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ProductoViewDetailsComponent {
  @Input() isVisible = false;
  @Input() producto: Producto | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  getStockClass(): string {
    if (!this.producto) return '';
    if (this.producto.stock < 20) return 'critical';
    return 'normal';
  }

  getStockPercentage(): number {
    if (!this.producto) return 0;
    // Asumir que 500 unidades es el 100%
    return Math.min((this.producto.stock / 500) * 100, 100);
  }

  getStockStatus(): string {
    if (!this.producto) return '';
    if (this.producto.stock > 100) return 'Stock Normal';
    if (this.producto.stock >= 20) return 'Stock Bajo';
    return 'Stock Crítico';
  }

  getStockStatusClass(): string {
    if (!this.producto) return '';
    if (this.producto.stock > 100) return 'status-normal';
    if (this.producto.stock >= 20) return 'status-warning';
    return 'status-critical';
  }

  getRotationLevel(): string {
    if (!this.producto) return '';
    const rotation = (this.producto.ganancia / this.producto.costoBs) * 100;
    if (rotation > 100) return '⭐ Muy Alta';
    if (rotation > 50) return '⭐ Alta';
    return '⭐ Normal';
  }
}
