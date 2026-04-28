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