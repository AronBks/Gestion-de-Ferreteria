// ============================================================================
// MODELOS DE VENTA Y FACTURACIÓN ELECTRÓNICA (SIAT Bolivia)
// ============================================================================

// --- Enums / Types ---

export type PaymentMethod = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'CHEQUE';
export type SaleStatus = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'DEVUELTA';
export type EstadoSiat = 'PENDIENTE' | 'EMITIDA' | 'ANULADA' | 'RECHAZADA' | 'OBSERVADA';
export type CanalEnvio = 'WHATSAPP' | 'EMAIL' | 'NINGUNO';

// --- Interfaces ---

export interface DetalleVenta {
  id?: string;
  productoId: number;
  producto?: { id: number; nombre: string; codigoProducto: string; codigo_producto?: string };
  cantidad: number;
  precioUnitario: number;
  descuentoItem?: number;
  subtotal: number;
}

export interface Factura {
  id: string;
  ventaId: string;
  cuf: string;
  cufd: string;
  numeroFactura: number;
  fechaEmision: string;
  codigoControl: string;
  numeroAutorizacion: string;
  leyendaSiat: string;
  estadoSiat: EstadoSiat;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  actividadEconomica: string;
  puntoVenta: number;
  sucursal: number;
  enviadaCliente: boolean;
  canalEnvio: CanalEnvio;
  fechaEnvio?: string;
  destinoEnvio?: string;
  fechaCreacion: string;
}

export interface Venta {
  id: string;
  numeroVenta: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  clienteTelefono?: string;
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
  factura?: Factura | null;
}

// --- Payloads / DTOs ---

export interface CreateVentaPayload {
  clienteNombre?: string;
  clienteDocumento?: string;
  clienteTelefono?: string;
  tipoComprobante: 'FACTURA' | 'BOLETA' | 'TICKET';
  metodoPago: PaymentMethod;
  montoPagado: number;
  descuentoTotal?: number;
  observaciones?: string;
  items: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    descuentoItem?: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnvioResult {
  success: boolean;
  canal: CanalEnvio;
  destino: string;
  mensaje: string;
  whatsappUrl?: string;
}
