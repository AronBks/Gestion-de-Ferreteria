import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../services/ventas.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { KPICardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [
    CommonModule, 
    PageHeaderComponent, 
    DataTableComponent, 
    StatusBadgeComponent,
    KPICardComponent, 
    FormsModule,
    ConfirmDialogComponent
  ],
  providers: [DatePipe],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto flex flex-col gap-6">
      
      <app-page-header 
        title="Gestión de Ventas" 
        [subtitle]="ventasHoy().transacciones + ' ventas hoy â€¢ Bs. ' + ventasHoy().total" 
        icon="receipt"
        actionLabel="+ Nueva Venta"
        (action)="irANuevaVenta()"
      ></app-page-header>

      <!-- KPI Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
        <app-kpi-card 
          title="Ventas Hoy (Bs)" 
          [value]="((ventasHoy().total || 0) | number:'1.2-2') || '0'"
          icon="attach_money"
          color="success">
        </app-kpi-card>
        <app-kpi-card
          title="MÃ©todo mÃ¡s usado"
          [value]="ventasHoy().metodoMasUsado"
          icon="account_balance_wallet"
          color="primary">
        </app-kpi-card>
        <app-kpi-card
          title="Ticket Promedio"
          [value]="((ventasHoy().ticketPromedio || 0) | number:'1.2-2') || '0'"
          icon="receipt_long" 
          color="info">
        </app-kpi-card>
      </div>

      <!-- Data Table -->
      <app-data-table 
        [columns]="columns" 
        [data]="ventas()" 
        [loading]="loading()"
        searchPlaceholder="Buscar por cliente o NÂº venta..."
      >
        <!-- Toolbar custom (Filters) -->
        <div toolbar class="flex gap-2">
          <select [(ngModel)]="filtros.estado" (change)="cargarVentas()" class="border px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <option value="">Todos los Estados</option>
            <option value="COMPLETADA">Completada</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="DEVUELTA">Devuelta</option>
          </select>

          <select [(ngModel)]="filtros.metodoPago" (change)="cargarVentas()" class="border px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <option value="">Métodos de Pago</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA_DEBITO">T. Débito</option>
            <option value="TARJETA_CREDITO">T. Crédito</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <!-- Custom Cell Templates -->
        <ng-template #cellTemplate let-row let-col="col">
          @switch(col.key) {
            
            @case('numeroVenta') {
              <span class="font-mono text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                {{ row.numeroVenta }}
              </span>
            }

            @case('fechaVenta') {
              {{ row.fechaVenta | date:'dd/MM/yyyy HH:mm' }}
            }

            @case('clienteNombre') {
              <span [class.text-gray-400]="!row.clienteNombre">
                {{ row.clienteNombre || 'Cliente General' }}
              </span>
            }

            @case('vendedor') {
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {{ (row.vendedor?.nombre?.charAt(0) || 'U') | uppercase }}
                </div>
                <span>{{ row.vendedor?.nombre }} {{ row.vendedor?.apellido }}</span>
              </div>
            }

            @case('metodoPago') {
              <div class="flex items-center gap-1">
                <span class="material-icons text-sm text-gray-500">
                  {{ getMetodoIcon(row.metodoPago) }}
                </span>
                <span>{{ row.metodoPago }}</span>
              </div>
            }

            @case('total') {
              <span class="font-bold text-green-600 dark:text-green-400">
                Bs. {{ row.total | number:'1.2-2' }}
              </span>
            }

            @case('estado') {
              <app-status-badge 
                [status]="row.estado" 
                [type]="getEstadoType(row.estado)"
                [animated]="row.estado === 'PENDIENTE'">
              </app-status-badge>
            }

            @case('acciones') {
              <div class="flex gap-2">
                <button (click)="verDetalle(row.id)" class="p-1 text-gray-500 hover:text-blue-500 transition-colors" title="Ver Detalle">
                  <span class="material-icons text-sm">visibility</span>
                </button>
                <button class="p-1 text-gray-500 hover:text-gray-900 transition-colors" title="Imprimir">
                  <span class="material-icons text-sm">print</span>
                </button>
                @if (row.estado !== 'CANCELADA') {
                  <button (click)="confirmarCancelacion(row)" class="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Cancelar">
                    <span class="material-icons text-sm">cancel</span>
                  </button>
                }
              </div>
            }

            @default {
              {{ row[col.key] }}
            }
          }
        </ng-template>
      </app-data-table>

      <app-confirm-dialog
        [isOpen]="cancelModalOpen"
        title="Cancelar Venta"
        [message]="'¿Estás seguro de que deseas cancelar la venta ' + ventaSeleccionada?.numeroVenta + '? El stock será devuelto al inventario.'"
        type="danger"
        confirmText="Sí, cancelar venta"
        (confirm)="ejecutarCancelacion()"
        (close)="cerrarModal()"
      ></app-confirm-dialog>

    </div>
  `
})
export class ListaVentasComponent implements OnInit {
  private ventasService = inject(VentasService);
  private router = inject(Router);
  private toast = inject(ToastService);

  ventas = signal<any[]>([]);
  ventasHoy = signal<any>({ total: 0, transacciones: 0, metodoMasUsado: '-', ticketPromedio: 0 });
  loading = signal(false);

  cancelModalOpen = false;
  ventaSeleccionada: any = null;

  filtros: any = {
    estado: '',
    metodoPago: ''
  };

  columns = [
    { key: 'numeroVenta', label: 'N° VENTA' },
    { key: 'fechaVenta', label: 'FECHA' },
    { key: 'clienteNombre', label: 'CLIENTE' },
    { key: 'vendedor', label: 'VENDEDOR' },
    { key: 'metodoPago', label: 'MÉTODO PAGO' },
    { key: 'total', label: 'TOTAL' },
    { key: 'estado', label: 'ESTADO' },
    { key: 'acciones', label: 'ACCIONES', sortable: false }
  ];

  ngOnInit() {
    this.cargarResumen();
    this.cargarVentas();
  }

  cargarResumen() {
    this.ventasService.getResumenHoy().subscribe(res => {
      this.ventasHoy.set(res);
    });
  }

  cargarVentas() {
    this.loading.set(true);
    this.ventasService.findAll(this.filtros).subscribe({
      next: (res) => {
        this.ventas.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  irANuevaVenta() {
    this.router.navigate(['/ventas/nueva']);
  }

  getMetodoIcon(metodo: string) {
    const icons: any = {
      'EFECTIVO': 'payments',
      'TARJETA_DEBITO': 'credit_card',
      'TARJETA_CREDITO': 'credit_card',
      'TRANSFERENCIA': 'account_balance'
    };
    return icons[metodo] || 'payments';
  }

  getEstadoType(estado: string): any {
    const types: any = {
      'COMPLETADA': 'success',
      'PENDIENTE': 'warning',
      'CANCELADA': 'danger',
      'DEVUELTA': 'neutral'
    };
    return types[estado] || 'neutral';
  }

  verDetalle(id: string) {
    this.router.navigate(['/ventas', id]);
  }

  confirmarCancelacion(venta: any) {
    this.ventaSeleccionada = venta;
    this.cancelModalOpen = true;
  }

  cerrarModal() {
    this.cancelModalOpen = false;
    this.ventaSeleccionada = null;
  }

  ejecutarCancelacion() {
    if (!this.ventaSeleccionada) return;
    
    this.ventasService.cancelar(this.ventaSeleccionada.id).subscribe({
      next: () => {
        this.toast.showSuccess(`Venta ${this.ventaSeleccionada.numeroVenta} cancelada correctamente.`);
        this.cargarVentas();
        this.cargarResumen();
        this.cerrarModal();
      },
      error: () => {
        this.cerrarModal();
      }
    });
  }
}