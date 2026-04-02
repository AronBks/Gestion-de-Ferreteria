import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

interface Venta {
  id: string;
  numeroVenta: number;
  fechaVenta: string;
  clienteNombre?: string;
  vendedor?: { nombre: string };
  metodoPago: string;
  total: number;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA';
}

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./lista-ventas.component.scss'],
  templateUrl: './lista-ventas.component.html'
})
export class ListaVentasComponent implements OnInit {
  private ventasService = inject(VentasService);
  private router = inject(Router);
  private toast = inject(ToastService);

  ventas = signal<Venta[]>([]);
  ventasHoy = signal<any>({ 
    total: 0, 
    transacciones: 0, 
    metodoMasUsado: '-', 
    ticketPromedio: 0 
  });
  loading = signal(false);
  cancelModalOpen = signal(false);
  ventaSeleccionada = signal<Venta | null>(null);

  filtros = signal({ estado: '', metodoPago: '' });

  ngOnInit() {
    this.cargarResumen();
    this.cargarVentas();
  }

  cargarResumen() {
    this.ventasService.getResumenHoy().subscribe({
      next: (res) => {
        this.ventasHoy.set(res || { total: 0, transacciones: 0, metodoMasUsado: '-', ticketPromedio: 0 });
      },
      error: (err) => {
        console.error('Error resumen:', err);
        this.ventasHoy.set({ total: 0, transacciones: 0, metodoMasUsado: '-', ticketPromedio: 0 });
      }
    });
  }

  cargarVentas() {
    this.loading.set(true);
    const f = this.filtros();
    this.ventasService.findAll(f).subscribe({
      next: (res) => {
        this.ventas.set(Array.isArray(res) ? res : res?.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error ventas:', err);
        this.loading.set(false);
        this.ventas.set([]);
      }
    });
  }

  irANuevaVenta() {
    this.router.navigate(['/ventas/nueva']);
  }

  verDetalle(id: string) {
    this.router.navigate(['/ventas', id]);
  }

  confirmarCancelacion(venta: Venta) {
    this.ventaSeleccionada.set(venta);
    this.cancelModalOpen.set(true);
  }

  ejecutarCancelacion() {
    const venta = this.ventaSeleccionada();
    if (!venta) return;
    
    this.ventasService.cancelar(venta.id).subscribe({
      next: () => {
        this.toast.showSuccess('Venta cancelada exitosamente');
        this.cerrarModal();
        this.cargarVentas();
        this.cargarResumen();
      },
      error: (err) => {
        console.error('Error:', err);
        this.toast.showError('Error al cancelar la venta');
      }
    });
  }

  cerrarModal() {
    this.cancelModalOpen.set(false);
    this.ventaSeleccionada.set(null);
  }

  trackByVentaId(index: number, venta: Venta) {
    return venta.id;
  }
}
