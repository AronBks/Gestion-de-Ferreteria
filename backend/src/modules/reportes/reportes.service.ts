import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportesService {
  constructor(private dataSource: DataSource) {}

  async getDashboardStats(dias: number) {
    const dateRango = new Date();
    dateRango.setDate(dateRango.getDate() - dias);
    // Para asegurar precisión desde el comienzo de ese dia:
    dateRango.setHours(0, 0, 0, 0);

    // 1. Ingresos totales y Ticket Promedio
    const resumenQuery = await this.dataSource.query(
      `SELECT COUNT(id) as total_ventas, SUM(total) as ingresos 
       FROM venta 
       WHERE "fechaVenta" >= $1 AND estado = 'COMPLETADA'`,
      [dateRango]
    );

    const ingresos = parseFloat(resumenQuery[0]?.ingresos || 0);
    const totalVentas = parseInt(resumenQuery[0]?.total_ventas || 0);
    const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;

    // 2. Top Productos Vendidos
    const topProductos = await this.dataSource.query(
      `SELECT p.nombre, SUM(dv.cantidad) as cantidad_vendida, SUM(dv.subtotal) as ingresos
       FROM detalle_venta dv
       JOIN producto p ON p.id = dv."productoId"
       JOIN venta v ON v.id = dv."ventaId"
       WHERE v."fechaVenta" >= $1 AND v.estado = 'COMPLETADA'
       GROUP BY p.id, p.nombre
       ORDER BY cantidad_vendida DESC
       LIMIT 5`,
      [dateRango]
    );

    // 3. Ventas agrupadas por Día para Gráfico (Compatible puramente Postgres)
    const ventasPorDia = await this.dataSource.query(
      `SELECT TO_CHAR("fechaVenta", 'YYYY-MM-DD') as fecha, 
              COUNT(id) as transacciones, 
              SUM(total) as total
       FROM venta
       WHERE "fechaVenta" >= $1 AND estado = 'COMPLETADA'
       GROUP BY TO_CHAR("fechaVenta", 'YYYY-MM-DD')
       ORDER BY fecha ASC`,
      [dateRango]
    );

    return {
      resumen: {
        ingresos,
        totalVentas,
        ticketPromedio
      },
      topProductos: topProductos.map(p => ({
        nombre: p.nombre,
        cantidadVendida: parseInt(p.cantidad_vendida),
        ingresos: parseFloat(p.ingresos)
      })),
      ventasPorDia: ventasPorDia.map(v => ({
        fecha: v.fecha,
        transacciones: parseInt(v.transacciones),
        total: parseFloat(v.total)
      }))
    };
  }
}