import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Venta, SaleStatus } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/producto.entity';
import { DetalleVenta } from '../ventas/entities/detalle-venta.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
  ) {}

  async getDashboardStats(dias: number) {
    const now = new Date();
    const dateRango = new Date();
    dateRango.setDate(dateRango.getDate() - dias);

    const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      const [totalProductos, ventasMesActual, ventasMesAnterior, todasLasVentasRango, productos] = await Promise.all([
        this.productoRepository.count(),
        this.ventaRepository.find({
          where: { fechaVenta: Between(inicioMesActual, now), estado: SaleStatus.COMPLETADA }
        }),
        this.ventaRepository.find({
          where: { fechaVenta: Between(inicioMesAnterior, finMesAnterior), estado: SaleStatus.COMPLETADA }
        }),
        this.ventaRepository.find({
          where: { fechaVenta: Between(dateRango, now), estado: SaleStatus.COMPLETADA }
        }),
        this.productoRepository.find()
      ]);

      const ingresosTotales = todasLasVentasRango.reduce((acc, v) => acc + Number(v.total), 0);
      const ventasMes = ventasMesActual.reduce((acc, v) => acc + Number(v.total), 0);
      const ventasAnterior = ventasMesAnterior.reduce((acc, v) => acc + Number(v.total), 0);
      
      let trendVentas = 0;
      if (ventasAnterior > 0) {
        trendVentas = ((ventasMes - ventasAnterior) / ventasAnterior) * 100;
      }

      const criticalItems = productos.filter(p => p.stock_actual <= p.stock_minimo);

      // Agrupación de Ventas por Día
      const ventasPorDiaMap = new Map();
      todasLasVentasRango.forEach(v => {
        const fecha = new Date(v.fechaVenta).toISOString().split('T')[0];
        const current = ventasPorDiaMap.get(fecha) || { transacciones: 0, total: 0 };
        ventasPorDiaMap.set(fecha, {
          transacciones: current.transacciones + 1,
          total: current.total + Number(v.total)
        });
      });

      const ventasPorDia = Array.from(ventasPorDiaMap.entries())
        .map(([fecha, data]) => ({ fecha, ...data }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      // Top Productos (Lógica real)
      // Buscamos los detalles de las ventas en el rango
      const detalles = await this.detalleVentaRepository.find({
        where: { venta: { fechaVenta: Between(dateRango, now), estado: SaleStatus.COMPLETADA } },
        relations: ['producto']
      });

      const topMap = new Map();
      detalles.forEach(d => {
        if (!d.producto) return;
        const current = topMap.get(d.producto.id) || { nombre: d.producto.nombre, cantidadVendida: 0 };
        topMap.set(d.producto.id, {
          nombre: d.producto.nombre,
          cantidadVendida: current.cantidadVendida + Number(d.cantidad)
        });
      });

      const topProductos = Array.from(topMap.values())
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
        .slice(0, 5);

      const recentSalesRaw = await this.ventaRepository.find({
        order: { fechaVenta: 'DESC' } as any,
        take: 5
      });

      return {
        kpis: {
          totalProductos,
          ventasMes,
          trendVentas: Math.round(trendVentas),
          stockCriticoCount: criticalItems.length,
          ingresosTotales
        },
        resumen: {
          ingresos: ingresosTotales,
          totalVentas: todasLasVentasRango.length,
          ticketPromedio: todasLasVentasRango.length > 0 ? ingresosTotales / todasLasVentasRango.length : 0
        },
        topProductos,
        ventasPorDia,
        recentSales: recentSalesRaw.map(v => ({
          id: v.id ? `V-${v.id.toString().substring(0, 4).toUpperCase()}` : 'V-0000',
          realId: v.id,
          customer: v.clienteNombre || 'Consumidor Final',
          amount: Number(v.total),
          date: new Date(v.fechaVenta).toLocaleDateString(),
          status: v.estado
        })),
        criticalStock: criticalItems.slice(0, 4).map(p => ({
          id: p.id,
          name: p.nombre,
          code: p.codigo_producto,
          stock: p.stock_actual
        }))
      };
    } catch (error) {
      console.error('Error in Dashboard:', error);
      throw error;
    }
  }
}