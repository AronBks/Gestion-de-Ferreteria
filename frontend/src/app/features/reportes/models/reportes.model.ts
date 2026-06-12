// ============================================================
// INTERFACES — Módulo de Reportes (Nuevo)
// ============================================================

export interface ReporteFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  categoriaId?: string;
  metodoPago?: string;
  page?: number;
  limit?: number;
}

export interface ReporteKPIs {
  ventasTotales: number;
  totalTransacciones: number;
  margenGanancia: number;
  stockCritico: number;
  trendVentas: number;
  trendMargen: number;
  trendTransacciones: number;
  ticketPromedio: number;
}

export interface ReporteVentaDia {
  fecha: string;
  total: number;
  transacciones: number;
}

export interface ReporteTopProducto {
  nombre: string;
  codigo: string;
  cantidadVendida: number;
  ingresos: number;
  margen: number;
}

export interface ReporteVentaProducto {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ReporteVentaRow {
  id: string;
  numeroVenta: string;
  fecha: string;
  clienteNombre: string;
  clienteDocumento: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  estado: string;
  vendedor: string;
  cantidadProductos: number;
  productos: ReporteVentaProducto[];
}

export interface ReporteTablaVentas {
  data: ReporteVentaRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReporteFiltrosAplicados {
  fechaInicio: string;
  fechaFin: string;
  categoriaId: string | null;
  metodoPago: string | null;
  rangoDias: number;
}

export interface ReporteResponse {
  kpis: ReporteKPIs;
  ventasPorDia: ReporteVentaDia[];
  topProductos: ReporteTopProducto[];
  tablaVentas: ReporteTablaVentas;
  filtrosAplicados: ReporteFiltrosAplicados;
}

export interface ReporteExportResponse {
  headers: string[];
  rows: any[];
  totalRegistros: number;
}

export interface CategoriaFiltro {
  id: string;
  nombre: string;
}

// ============================================================
// INTERFACES — Dashboard Original (compatibilidad)
// ============================================================

export interface TopProductoStatus {
  nombre: string;
  cantidadVendida: number;
  ingresos: number;
}

export interface VentaDiaStatus {
  fecha: string;
  transacciones: number;
  total: number;
}

export interface RecentSale {
  id: string;
  realId?: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

export interface CriticalStockItem {
  id: number;
  name: string;
  code: string;
  stock: number;
}

export interface DashboardResponse {
  kpis: {
    totalProductos: number;
    ventasMes: number;
    trendVentas: number;
    stockCriticoCount: number;
    ingresosTotales: number;
  };
  resumen: {
    ingresos: number;
    totalVentas: number;
    ticketPromedio: number;
  };
  topProductos: TopProductoStatus[];
  ventasPorDia: VentaDiaStatus[];
  recentSales: RecentSale[];
  criticalStock: CriticalStockItem[];
}