export interface Venta {
  id: string;
  numeroVenta: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  fechaVenta: string;
  vendedorId: string;
  vendedor?: { id: string; nombre: string; apellido: string };
  subtotal: number;
  igv: number;
  descuentoTotal: number;
  total: number;
  montoPagado: number;
  vuelto: number;
  metodoPago: PaymentMethod;
  estado: SaleStatus;
  detalles?: DetalleVenta[];
}

export interface DetalleVenta {
  id?: string;
  productoId: string;
  producto?: { id: string; nombre: string; codigoProducto: string };
  cantidad: number;
  precioUnitario: number;
  descuentoItem?: number;
  subtotal: number;
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'CHEQUE';
export type SaleStatus = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'DEVUELTA';

export interface CreateVentaPayload {
  clienteNombre?: string;
  clienteDocumento?: string;
  tipoComprobante: 'FACTURA' | 'BOLETA' | 'TICKET';
  metodoPago: PaymentMethod;
  montoPagado: number;
  descuentoTotal?: number;
  observaciones?: string;
  items: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    descuentoItem?: number;
  }[];
}
