import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentasService } from '../../services/ventas.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto flex flex-col gap-6" *ngIf="venta">
      
      <app-page-header 
        [title]="'Venta ' + venta.numeroVenta" 
        [subtitle]="(venta.fechaVenta | date:'medium') || ''" 
        icon="receipt_long"
        actionLabel="Volver"
        (action)="volver()"
      ></app-page-header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Detalles Principales -->
        <div class="md:col-span-2 space-y-6">
          <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div class="p-4 border-b border-border dark:border-gray-700 font-semibold flex justify-between items-center">
              Productos
              <app-status-badge [status]="venta.estado" [type]="venta.estado === 'COMPLETADA' ? 'success' : (venta.estado === 'CANCELADA' ? 'danger' : 'neutral')"></app-status-badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm whitespace-nowrap text-text-secondary dark:text-gray-300">
                <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th class="px-6 py-4">Producto</th>
                    <th class="px-6 py-4 text-center">Cant.</th>
                    <th class="px-6 py-4 text-right">P. Unitario</th>
                    <th class="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border dark:divide-gray-700">
                  @for (item of venta.detalles; track item.id) {
                    <tr>
                      <td class="px-6 py-4">
                        <div class="font-medium text-gray-900 dark:text-white">{{ item.producto?.nombre || 'Producto Desconocido' }}</div>
                        <div class="text-xs font-mono text-gray-500">{{ item.producto?.codigoProducto }}</div>
                      </td>
                      <td class="px-6 py-4 text-center">{{ item.cantidad }}</td>
                      <td class="px-6 py-4 text-right">Bs. {{ item.precioUnitario | number:'1.2-2' }}</td>
                      <td class="px-6 py-4 text-right font-medium">Bs. {{ item.subtotal | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Resumen Financiero y Cliente -->
        <div class="space-y-6">
          <div class="bg-surface border border-border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 class="font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Resumen</h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>Bs. {{ venta.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-red-500">
                <span>Descuento</span>
                <span>- Bs. {{ venta.descuentoTotal | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 font-bold text-lg text-gray-900 dark:text-white">
                <span>Total</span>
                <span class="text-amber-500">Bs. {{ venta.total | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Pago</h3>
              <div class="flex justify-between text-sm mb-1">
                <span>Método</span>
                <span class="font-medium">{{ venta.metodoPago }}</span>
              </div>
              <div class="flex justify-between text-sm mb-1">
                <span>Recibido</span>
                <span>Bs. {{ venta.montoPagado | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Vuelto</span>
                <span>Bs. {{ venta.vuelto | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-surface border border-border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 text-sm">
            <h3 class="font-semibold mb-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Datos Adicionales</h3>
            <div class="space-y-3">
              <div>
                <p class="text-gray-500 text-xs">Cliente</p>
                <p class="font-medium">{{ venta.clienteNombre || 'Cliente General' }}</p>
                <p class="text-gray-500" *ngIf="venta.clienteDocumento">{{ venta.clienteDocumento }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Vendedor</p>
                <p class="font-medium">{{ venta.vendedor?.nombre }} {{ venta.vendedor?.apellido }}</p>
              </div>
              <div *ngIf="venta.observaciones">
                <p class="text-gray-500 text-xs">Observaciones</p>
                <p class="italic">"{{ venta.observaciones }}"</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class DetalleVentaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventasService = inject(VentasService);

  venta: any = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ventasService.findOne(id).subscribe(res => {
        this.venta = res;
      });
    }
  }

  volver() {
    this.router.navigate(['/ventas']);
  }
}