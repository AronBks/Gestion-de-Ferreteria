import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VentasService } from '../../services/ventas.service';
import { FacturacionService } from '../../services/facturacion.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Venta, EstadoSiat, CanalEnvio } from '../../models/venta.model';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./lista-ventas.component.scss'],
  templateUrl: './lista-ventas.component.html'
})
export class ListaVentasComponent implements OnInit {
  private ventasService = inject(VentasService);
  private facturacionService = inject(FacturacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  // --- Datos ---
  ventas = signal<Venta[]>([]);
  ventasHoy = signal<any>({
    total: 0,
    transacciones: 0,
    metodoMasUsado: '-',
    ticketPromedio: 0
  });

  // --- Estado UI ---
  loading = signal(false);
  dropdownOpenId = signal<string | null>(null);

  // --- Modales ---
  cancelModalOpen = signal(false);
  anularFacturaModalOpen = signal(false);
  whatsappModalOpen = signal(false);
  ventaSeleccionada = signal<Venta | null>(null);
  whatsappTelefono = signal('');

  // --- Paginación ---
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(0);

  // --- Filtros ---
  filtroEstado = signal('');
  filtroMetodoPago = signal('');
  filtroEstadoFactura = signal('');

  ngOnInit() {
    this.cargarResumen();
    this.cargarVentas();
  }

  // Cerrar dropdown al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-dropdown-wrapper')) {
      this.dropdownOpenId.set(null);
    }
  }

  // ========================================================================
  // CARGA DE DATOS
  // ========================================================================

  cargarResumen() {
    this.ventasService.getResumenHoy().subscribe({
      next: (res) => {
        this.ventasHoy.set(res || { total: 0, transacciones: 0, metodoMasUsado: '-', ticketPromedio: 0 });
      },
      error: () => {
        this.ventasHoy.set({ total: 0, transacciones: 0, metodoMasUsado: '-', ticketPromedio: 0 });
      }
    });
  }

  cargarVentas() {
    this.loading.set(true);

    const filters: Record<string, any> = {
      page: this.page(),
      limit: this.limit(),
      estado: this.filtroEstado(),
      metodoPago: this.filtroMetodoPago(),
      estadoFactura: this.filtroEstadoFactura()
    };

    this.ventasService.findAll(filters).subscribe({
      next: (res) => {
        this.ventas.set(res.data || []);
        this.total.set(res.total || 0);
        this.totalPages.set(res.totalPages || 0);
        this.page.set(res.page || 1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.ventas.set([]);
      }
    });
  }

  // ========================================================================
  // FILTROS
  // ========================================================================

  onFiltroChange() {
    this.page.set(1);
    this.cargarVentas();
  }

  // ========================================================================
  // PAGINACIÓN
  // ========================================================================

  irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.page.set(pagina);
    this.cargarVentas();
  }

  paginasVisibles(): number[] {
    const current = this.page();
    const total = this.totalPages();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    // Asegurar al menos 5 páginas visibles si existen
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(total, start + 4);
      } else {
        start = Math.max(1, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ========================================================================
  // NAVEGACIÓN
  // ========================================================================

  irANuevaVenta() {
    this.router.navigate(['nueva'], { relativeTo: this.route });
  }

  verDetalle(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  // ========================================================================
  // DROPDOWN DE ACCIONES
  // ========================================================================

  toggleDropdown(ventaId: string, event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpenId.set(
      this.dropdownOpenId() === ventaId ? null : ventaId
    );
  }

  // ========================================================================
  // CANCELAR VENTA
  // ========================================================================

  confirmarCancelacion(venta: Venta) {
    this.ventaSeleccionada.set(venta);
    this.cancelModalOpen.set(true);
    this.dropdownOpenId.set(null);
  }

  ejecutarCancelacion() {
    const venta = this.ventaSeleccionada();
    if (!venta) return;

    this.ventasService.cancelar(venta.id).subscribe({
      next: () => {
        this.toast.showSuccess('Venta cancelada exitosamente');
        this.cerrarModales();
        this.cargarVentas();
        this.cargarResumen();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al cancelar la venta';
        this.toast.showError(msg);
      }
    });
  }

  // ========================================================================
  // ANULAR FACTURA
  // ========================================================================

  abrirAnularFactura(venta: Venta) {
    this.ventaSeleccionada.set(venta);
    this.anularFacturaModalOpen.set(true);
    this.dropdownOpenId.set(null);
  }

  ejecutarAnularFactura() {
    const venta = this.ventaSeleccionada();
    if (!venta?.factura) return;

    this.facturacionService.anularFactura(
      venta.factura.id,
      'Anulación solicitada desde el listado de ventas'
    ).subscribe({
      next: () => {
        this.toast.showSuccess(`Factura #${venta.factura!.numeroFactura} anulada exitosamente`);
        this.cerrarModales();
        this.cargarVentas();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al anular la factura';
        this.toast.showError(msg);
      }
    });
  }

  // ========================================================================
  // REENVIAR POR WHATSAPP
  // ========================================================================

  abrirReenviarWhatsApp(venta: Venta) {
    this.ventaSeleccionada.set(venta);
    this.whatsappTelefono.set(venta.clienteTelefono || '');
    this.whatsappModalOpen.set(true);
    this.dropdownOpenId.set(null);
  }

  ejecutarEnvioWhatsApp() {
    const venta = this.ventaSeleccionada();
    if (!venta?.factura) return;

    const telefono = this.whatsappTelefono().trim();
    if (!telefono) {
      this.toast.showWarning('Ingresa un número de teléfono');
      return;
    }

    this.facturacionService.enviarFactura(
      venta.factura.id,
      'WHATSAPP' as CanalEnvio,
      telefono
    ).subscribe({
      next: (result) => {
        if (result.success && result.whatsappUrl) {
          // Abrir enlace wa.me en nueva pestaña
          window.open(result.whatsappUrl, '_blank');
          this.toast.showSuccess('Enlace de WhatsApp abierto');
        } else {
          this.toast.showWarning(result.mensaje || 'No se pudo generar el enlace');
        }
        this.cerrarModales();
        this.cargarVentas();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al generar enlace de WhatsApp';
        this.toast.showError(msg);
      }
    });
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  cerrarModales() {
    this.cancelModalOpen.set(false);
    this.anularFacturaModalOpen.set(false);
    this.whatsappModalOpen.set(false);
    this.ventaSeleccionada.set(null);
    this.whatsappTelefono.set('');
  }

  getEstadoFacturaLabel(venta: Venta): string {
    if (!venta.factura) return 'Sin Factura';
    return venta.factura.estadoSiat;
  }

  getEstadoFacturaClass(venta: Venta): string {
    if (!venta.factura) return 'factura-none';
    switch (venta.factura.estadoSiat) {
      case 'EMITIDA':    return 'factura-emitida';
      case 'ANULADA':    return 'factura-anulada';
      case 'PENDIENTE':  return 'factura-pendiente';
      case 'RECHAZADA':  return 'factura-rechazada';
      case 'OBSERVADA':  return 'factura-observada';
      default:           return 'factura-none';
    }
  }

  tieneFacturaEmitida(venta: Venta): boolean {
    return venta.factura?.estadoSiat === 'EMITIDA';
  }

  puedeAnularFactura(venta: Venta): boolean {
    return venta.factura?.estadoSiat === 'EMITIDA';
  }

  trackByVentaId(_index: number, venta: Venta) {
    return venta.id;
  }
}
