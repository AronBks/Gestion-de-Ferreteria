import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturacionService } from '../../../features/ventas/services/facturacion.service';
import { ToastService } from '../../../core/services/toast.service';
import { Factura, CanalEnvio } from '../../../features/ventas/models/venta.model';

@Component({
  selector: 'app-factura-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factura-modal.component.html',
  styleUrls: ['./factura-modal.component.scss']
})
export class FacturaModalComponent {
  @Input() isOpen = false;
  @Input() facturaData: any = null;
  @Input() facturaInfo: Factura | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() nuevaVenta = new EventEmitter<void>();

  private facturacionService = inject(FacturacionService);
  private toast = inject(ToastService);

  ferreteriaData = {
    nombre: 'FERRETERÍA POS',
    direccion: 'Av. Industrial 123, Zona Centro',
    telefono: '+591 76543210',
    nit: '1234567890',
    ciudad: 'Bolivia'
  };

  // --- Estado de emisión ---
  emitiendo = false;
  emisionExitosa = false;
  facturaEmitida: Factura | null = null;

  // --- WhatsApp ---
  whatsappInputOpen = false;
  whatsappTel = '';
  enviandoWhatsApp = false;

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  ngOnChanges(): void {
    // Resetear estado cuando se abre un nuevo modal
    if (this.isOpen) {
      this.emisionExitosa = false;
      this.facturaEmitida = null;
      this.whatsappInputOpen = false;
      this.whatsappTel = this.facturaData?.clienteTelefono || '';
      this.enviandoWhatsApp = false;

      // Si ya viene con info de factura (reabrir)
      if (this.facturaInfo) {
        this.facturaEmitida = this.facturaInfo;
        this.emisionExitosa = true;
      }
    }
  }

  // --------------------------------------------------------------------------
  // EMITIR FACTURA ELECTRÓNICA
  // --------------------------------------------------------------------------

  emitirFactura(): void {
    if (!this.facturaData?.id || this.emitiendo) return;

    this.emitiendo = true;
    this.facturacionService.emitirFactura(
      this.facturaData.id,
      this.facturaData.clienteTelefono
    ).subscribe({
      next: (factura) => {
        this.facturaEmitida = factura;
        this.emisionExitosa = true;
        this.emitiendo = false;
        this.toast.showSuccess(`✅ Factura #${factura.numeroFactura} emitida exitosamente`);
      },
      error: (err) => {
        this.emitiendo = false;
        const msg = err?.error?.message || 'Error al emitir factura';
        this.toast.showError(msg);
      }
    });
  }

  // --------------------------------------------------------------------------
  // ENVIAR POR WHATSAPP
  // --------------------------------------------------------------------------

  toggleWhatsAppInput(): void {
    this.whatsappInputOpen = !this.whatsappInputOpen;
  }

  enviarWhatsApp(): void {
    if (!this.facturaEmitida || !this.whatsappTel.trim()) {
      this.toast.showWarning('Ingresa un número de teléfono');
      return;
    }

    this.enviandoWhatsApp = true;

    this.facturacionService.enviarFactura(
      this.facturaEmitida.id,
      'WHATSAPP' as CanalEnvio,
      this.whatsappTel.trim()
    ).subscribe({
      next: (result) => {
        this.enviandoWhatsApp = false;
        if (result.success && result.whatsappUrl) {
          window.open(result.whatsappUrl, '_blank');
          this.toast.showSuccess('WhatsApp abierto con la factura');
        } else {
          this.toast.showWarning(result.mensaje || 'No se pudo generar el enlace');
        }
      },
      error: (err) => {
        this.enviandoWhatsApp = false;
        const msg = err?.error?.message || 'Error al enviar por WhatsApp';
        this.toast.showError(msg);
      }
    });
  }

  // --------------------------------------------------------------------------
  // ACCIONES
  // --------------------------------------------------------------------------

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }

  onNuevaVenta(): void {
    this.isOpen = false;
    this.nuevaVenta.emit();
  }

  printFactura(): void {
    window.print();
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  get cufCorto(): string {
    const cuf = this.facturaEmitida?.cuf || '';
    return cuf.length > 24 ? `${cuf.substring(0, 24)}...` : cuf;
  }

  get fechaEmisionFormateada(): string {
    if (!this.facturaEmitida?.fechaEmision) return '';
    return new Date(this.facturaEmitida.fechaEmision).toLocaleString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
