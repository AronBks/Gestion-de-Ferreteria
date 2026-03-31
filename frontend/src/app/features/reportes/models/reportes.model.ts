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

export interface DashboardResponse {
  resumen: {
    ingresos: number;
    totalVentas: number;
    ticketPromedio: number;
  };
  topProductos: TopProductoStatus[];
  ventasPorDia: VentaDiaStatus[];
}