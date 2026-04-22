import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentasService } from '../../services/ventas.service';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detalle-container" *ngIf="venta()">
      <!-- HEADER -->
      <header class="detalle-header">
        <div class="header-content">
          <div class="header-info">
            <button class="btn-back" (click)="volver()">
              <span class="material-icons">arrow_back</span>
            </button>
            <div>
              <h1 class="header-title">Venta #{{ venta().numeroVenta }}</h1>
              <p class="header-subtitle">{{ venta().fechaVenta | date:'fullDate':'':'es-BO' }} - {{ venta().fechaVenta | date:'HH:mm' }}</p>
            </div>
          </div>
          <div class="header-status">
            <span class="status-badge" [ngClass]="{
              'status-success': venta().estado === 'COMPLETADA',
              'status-danger': venta().estado === 'CANCELADA'
            }">{{ venta().estado }}</span>
          </div>
        </div>
      </header>

      <main class="detalle-main">
        <div class="detalle-grid">
          
          <!-- COLUMNA IZQUIERDA: PRODUCTOS -->
          <section class="detalle-left">
            <div class="card card-productos">
              <div class="card-header">
                <span class="material-icons">shopping_bag</span>
                <h2>Productos</h2>
                <span class="badge-count">{{ venta().detalles?.length || 0 }} ítems</span>
              </div>
              
              <div class="table-wrapper">
                <table class="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-right">Precio</th>
                      <th class="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of venta().detalles; track item.id) {
                      <tr>
                        <td>
                          <div class="product-info">
                            <span class="product-name">{{ item.producto?.nombre }}</span>
                            <span class="product-code">{{ item.producto?.codigo_producto }}</span>
                          </div>
                        </td>
                        <td class="text-center">{{ item.cantidad }}</td>
                        <td class="text-right">Bs. {{ item.precioUnitario | number:'1.2-2' }}</td>
                        <td class="text-right font-bold text-amber-500">Bs. {{ item.subtotal | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card card-observaciones" *ngIf="venta().observaciones">
              <div class="card-header">
                <span class="material-icons">notes</span>
                <h2>Observaciones</h2>
              </div>
              <p class="obs-text">{{ venta().observaciones }}</p>
            </div>
          </section>

          <!-- COLUMNA DERECHA: RESUMEN Y CLIENTE -->
          <section class="detalle-right">
            <!-- CARD RESUMEN -->
            <div class="card card-resumen">
              <div class="card-header">
                <span class="material-icons">analytics</span>
                <h2>Resumen de Venta</h2>
              </div>
              <div class="resumen-rows">
                <div class="resumen-row">
                  <span>Subtotal</span>
                  <span>Bs. {{ venta().subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="resumen-row discount" *ngIf="venta().descuentoTotal > 0">
                  <span>Descuento</span>
                  <span>- Bs. {{ venta().descuentoTotal | number:'1.2-2' }}</span>
                </div>
                <div class="resumen-divider"></div>
                <div class="resumen-total">
                  <span>TOTAL</span>
                  <span class="total-value">Bs. {{ venta().total | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="pago-details">
                <div class="pago-header">
                  <span class="material-icons">payments</span>
                  <h3>Información de Pago</h3>
                </div>
                <div class="pago-grid">
                  <div class="pago-item">
                    <label>Método</label>
                    <span>{{ venta().metodoPago }}</span>
                  </div>
                  <div class="pago-item" *ngIf="venta().metodoPago === 'EFECTIVO'">
                    <label>Recibido</label>
                    <span>Bs. {{ venta().montoPagado | number:'1.2-2' }}</span>
                  </div>
                  <div class="pago-item" *ngIf="venta().metodoPago === 'EFECTIVO'">
                    <label>Vuelto</label>
                    <span class="text-success font-bold">Bs. {{ venta().vuelto | number:'1.2-2' }}</span>
                  </div>
                  <div class="pago-item" *ngIf="venta().metodoPago !== 'EFECTIVO'">
                    <label>Referencia</label>
                    <span>{{ venta().numeroReferencia || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD CLIENTE Y VENDEDOR -->
            <div class="card card-info">
              <div class="card-header">
                <span class="material-icons">group</span>
                <h2>Participantes</h2>
              </div>
              <div class="info-sections">
                <div class="info-section">
                  <div class="info-icon">
                    <span class="material-icons text-amber-500">person</span>
                  </div>
                  <div class="info-content">
                    <label>Cliente</label>
                    <p>{{ venta().clienteNombre || 'Cliente General' }}</p>
                    <small *ngIf="venta().clienteDocumento">CI/NIT: {{ venta().clienteDocumento }}</small>
                  </div>
                </div>
                <div class="info-section">
                  <div class="info-icon">
                    <span class="material-icons text-blue-400">badge</span>
                  </div>
                  <div class="info-content">
                    <label>Vendedor</label>
                    <p>{{ venta().vendedor?.nombre }} {{ venta().vendedor?.apellido }}</p>
                    <small>ID: {{ venta().vendedorId }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCIONES -->
            <div class="detalle-actions">
              <button class="btn btn-secondary" (click)="volver()">
                <span class="material-icons">view_list</span>
                Volver al listado
              </button>
              <button class="btn btn-primary" (click)="imprimir()">
                <span class="material-icons">print</span>
                Imprimir Recibo
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .detalle-container {
      min-height: 100vh;
      background-color: #0f0f1e;
      color: white;
      padding: 2rem;
    }

    .detalle-header {
      margin-bottom: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      border: 1px solid #3d3d5c;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .btn-back {
      background: #2b2b40;
      border: 1px solid #3d3d5c;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #F59E0B;
      border-color: #F59E0B;
    }

    .header-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .header-subtitle {
      color: #b0b0cc;
      margin: 0;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.5rem 1.25rem;
      border-radius: 2rem;
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status-success {
      background: rgba(81, 207, 102, 0.2);
      color: #51cf66;
      border: 1px solid #51cf66;
    }

    .status-danger {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
      border: 1px solid #ff6b6b;
    }

    .detalle-main {
      max-width: 1400px;
      margin: 0 auto;
    }

    .detalle-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    .card {
      background: #1a1a2e;
      border: 1px solid #3d3d5c;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #3d3d5c;
      padding-bottom: 1rem;
    }

    .card-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      flex: 1;
    }

    .card-header span:first-child {
      color: #F59E0B;
    }

    .badge-count {
      background: #2b2b40;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      color: #b0b0cc;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .productos-table {
      width: 100%;
      border-collapse: collapse;
    }

    .productos-table th {
      text-align: left;
      padding: 1rem;
      color: #b0b0cc;
      font-size: 0.75rem;
      text-transform: uppercase;
      border-bottom: 1px solid #3d3d5c;
    }

    .productos-table td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(61, 61, 92, 0.5);
    }

    .product-info {
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .product-code {
      font-size: 0.75rem;
      color: #808094;
      font-family: monospace;
    }

    .resumen-rows {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .resumen-row {
      display: flex;
      justify-content: space-between;
      color: #b0b0cc;
      font-size: 0.9rem;
    }

    .resumen-divider {
      height: 1px;
      background: #3d3d5c;
      margin: 0.5rem 0;
    }

    .resumen-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
    }

    .total-value {
      font-size: 1.75rem;
      color: #F59E0B;
    }

    .pago-details {
      margin-top: 2rem;
      background: rgba(245, 158, 11, 0.05);
      border-radius: 0.75rem;
      padding: 1.25rem;
      border: 1px solid rgba(245, 158, 11, 0.1);
    }

    .pago-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #F59E0B;
    }

    .pago-header h3 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .pago-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .pago-item label {
      display: block;
      font-size: 0.7rem;
      color: #808094;
      text-transform: uppercase;
    }

    .pago-item span {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .info-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-section {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      background: #2b2b40;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-content label {
      display: block;
      font-size: 0.7rem;
      color: #808094;
      text-transform: uppercase;
    }

    .info-content p {
      margin: 0;
      font-weight: 600;
    }

    .info-content small {
      color: #808094;
      font-size: 0.7rem;
    }

    .detalle-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn {
      padding: 1rem;
      border-radius: 0.75rem;
      border: none;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .btn-primary {
      background: #F59E0B;
      color: white;
    }

    .btn-primary:hover {
      background: #d97706;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #2b2b40;
      color: white;
      border: 1px solid #3d3d5c;
    }

    .btn-secondary:hover {
      background: #353554;
    }

    .text-success { color: #51cf66; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }

    @media (max-width: 1024px) {
      .detalle-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DetalleVentaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventasService = inject(VentasService);

  venta = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ventasService.findOne(id).subscribe({
        next: (res) => {
          this.venta.set(res);
        },
        error: (err) => {
          console.error('Error al cargar detalle:', err);
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/ventas']);
  }

  imprimir() {
    window.print();
  }
}