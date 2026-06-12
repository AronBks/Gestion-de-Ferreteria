import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Venta, SaleStatus } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/producto.entity';
import { DetalleVenta } from '../ventas/entities/detalle-venta.entity';
import { Categoria } from '../categorias/categoria.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // ENDPOINT PRINCIPAL: GET /reportes/modulo
  // Retorna KPIs, gráficos y tabla paginada con filtros avanzados
  // ============================================================
  async getReportesData(filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    categoriaId?: string;
    metodoPago?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      fechaInicio,
      fechaFin,
      categoriaId,
      metodoPago,
      page = 1,
      limit = 10,
    } = filtros;

    // Calcular rango de fechas
    const now = new Date();
    const fin = fechaFin ? new Date(fechaFin + 'T23:59:59.999') : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : (() => {
      const d = new Date(fin);
      d.setDate(d.getDate() - 30);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    // Periodo anterior (mismo rango de días) para comparación de tendencia
    const rangoDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const inicioAnterior = new Date(inicio);
    inicioAnterior.setDate(inicioAnterior.getDate() - rangoDias);
    const finAnterior = new Date(inicio);
    finAnterior.setMilliseconds(finAnterior.getMilliseconds() - 1);

    try {
      const [kpis, ventasPorDia, topProductos, tablaVentas, periodoAnterior] = await Promise.all([
        this.calcularKPIs(inicio, fin, categoriaId, metodoPago),
        this.obtenerVentasPorDia(inicio, fin, categoriaId, metodoPago),
        this.obtenerTopProductos(inicio, fin, categoriaId, metodoPago),
        this.obtenerTablaVentas(inicio, fin, categoriaId, metodoPago, page, limit),
        this.calcularKPIs(inicioAnterior, finAnterior, categoriaId, metodoPago),
      ]);

      // Calcular tendencias (% cambio vs periodo anterior)
      const trendVentas = periodoAnterior.ventasTotales > 0
        ? Math.round(((kpis.ventasTotales - periodoAnterior.ventasTotales) / periodoAnterior.ventasTotales) * 100)
        : 0;
      const trendMargen = periodoAnterior.margenGanancia > 0
        ? Math.round(((kpis.margenGanancia - periodoAnterior.margenGanancia) / periodoAnterior.margenGanancia) * 100)
        : 0;
      const trendTransacciones = periodoAnterior.totalTransacciones > 0
        ? Math.round(((kpis.totalTransacciones - periodoAnterior.totalTransacciones) / periodoAnterior.totalTransacciones) * 100)
        : 0;

      return {
        kpis: {
          ...kpis,
          trendVentas,
          trendMargen,
          trendTransacciones,
          ticketPromedio: kpis.totalTransacciones > 0
            ? parseFloat((kpis.ventasTotales / kpis.totalTransacciones).toFixed(2))
            : 0,
        },
        ventasPorDia,
        topProductos,
        tablaVentas,
        filtrosAplicados: {
          fechaInicio: inicio.toISOString().split('T')[0],
          fechaFin: fin.toISOString().split('T')[0],
          categoriaId: categoriaId || null,
          metodoPago: metodoPago || null,
          rangoDias,
        },
      };
    } catch (error) {
      console.error('[ReportesService] Error en getReportesData:', error);
      throw error;
    }
  }

  // ============================================================
  // KPIs: Cálculo eficiente con QueryBuilder
  // Margen calculado directamente en la consulta SQL
  // ============================================================
  private async calcularKPIs(
    inicio: Date,
    fin: Date,
    categoriaId?: string,
    metodoPago?: string,
  ) {
    // Query para ventas totales y transacciones
    const ventasQuery = this.ventaRepository.createQueryBuilder('v')
      .select('COALESCE(SUM(v.total), 0)', 'ventasTotales')
      .addSelect('COUNT(v.id)', 'totalTransacciones')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin });

    if (metodoPago) {
      ventasQuery.andWhere('v.metodoPago = :metodoPago', { metodoPago });
    }

    // Si hay filtro de categoría, necesitamos join con detalles y productos
    if (categoriaId) {
      ventasQuery
        .innerJoin('v.detalles', 'dv_filter')
        .innerJoin('dv_filter.producto', 'p_filter')
        .andWhere('p_filter.categoria_id = :categoriaId', { categoriaId });
    }

    const ventasResult = await ventasQuery.getRawOne();

    // Query para margen de ganancia — calculado en la BD
    // Margen = SUM((precio_venta - precio_costo) * cantidad) para cada detalle vendido
    const margenQuery = this.detalleVentaRepository.createQueryBuilder('dv')
      .select('COALESCE(SUM((p.precio_venta - p.precio_costo) * dv.cantidad), 0)', 'margenGanancia')
      .innerJoin('dv.venta', 'v')
      .innerJoin('dv.producto', 'p')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin });

    if (metodoPago) {
      margenQuery.andWhere('v.metodoPago = :metodoPago', { metodoPago });
    }
    if (categoriaId) {
      margenQuery.andWhere('p.categoria_id = :categoriaId', { categoriaId });
    }

    const margenResult = await margenQuery.getRawOne();

    // Stock crítico — productos con stock_actual <= stock_minimo
    const stockQuery = this.productoRepository.createQueryBuilder('p')
      .select('COUNT(p.id)', 'stockCritico')
      .where('p.stock_actual <= p.stock_minimo')
      .andWhere("p.estado = 'ACTIVO'");

    if (categoriaId) {
      stockQuery.andWhere('p.categoria_id = :categoriaId', { categoriaId });
    }

    const stockResult = await stockQuery.getRawOne();

    return {
      ventasTotales: parseFloat(ventasResult.ventasTotales) || 0,
      totalTransacciones: parseInt(ventasResult.totalTransacciones) || 0,
      margenGanancia: parseFloat(margenResult.margenGanancia) || 0,
      stockCritico: parseInt(stockResult.stockCritico) || 0,
    };
  }

  // ============================================================
  // GRÁFICO DE LÍNEAS: Ventas agrupadas por día
  // ============================================================
  private async obtenerVentasPorDia(
    inicio: Date,
    fin: Date,
    categoriaId?: string,
    metodoPago?: string,
  ) {
    const query = this.ventaRepository.createQueryBuilder('v')
      .select("TO_CHAR(v.fechaVenta, 'YYYY-MM-DD')", 'fecha')
      .addSelect('COALESCE(SUM(v.total), 0)', 'total')
      .addSelect('COUNT(v.id)', 'transacciones')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin })
      .groupBy("TO_CHAR(v.fechaVenta, 'YYYY-MM-DD')")
      .orderBy('fecha', 'ASC');

    if (metodoPago) {
      query.andWhere('v.metodoPago = :metodoPago', { metodoPago });
    }
    if (categoriaId) {
      query
        .innerJoin('v.detalles', 'dv_chart')
        .innerJoin('dv_chart.producto', 'p_chart')
        .andWhere('p_chart.categoria_id = :categoriaId', { categoriaId });
    }

    const rawData = await query.getRawMany();

    return rawData.map(row => ({
      fecha: row.fecha,
      total: parseFloat(row.total) || 0,
      transacciones: parseInt(row.transacciones) || 0,
    }));
  }

  // ============================================================
  // GRÁFICO DE BARRAS: Top 10 productos más vendidos
  // ============================================================
  private async obtenerTopProductos(
    inicio: Date,
    fin: Date,
    categoriaId?: string,
    metodoPago?: string,
  ) {
    const query = this.detalleVentaRepository.createQueryBuilder('dv')
      .select('p.nombre', 'nombre')
      .addSelect('p.codigo_producto', 'codigo')
      .addSelect('SUM(dv.cantidad)', 'cantidadVendida')
      .addSelect('COALESCE(SUM(dv.subtotal), 0)', 'ingresos')
      .addSelect('COALESCE(SUM((p.precio_venta - p.precio_costo) * dv.cantidad), 0)', 'margen')
      .innerJoin('dv.venta', 'v')
      .innerJoin('dv.producto', 'p')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin })
      .groupBy('p.id')
      .addGroupBy('p.nombre')
      .addGroupBy('p.codigo_producto')
      .orderBy('SUM(dv.cantidad)', 'DESC')
      .limit(10);

    if (metodoPago) {
      query.andWhere('v.metodoPago = :metodoPago', { metodoPago });
    }
    if (categoriaId) {
      query.andWhere('p.categoria_id = :categoriaId', { categoriaId });
    }

    const rawData = await query.getRawMany();

    return rawData.map(row => ({
      nombre: row.nombre,
      codigo: row.codigo,
      cantidadVendida: parseInt(row.cantidadVendida) || 0,
      ingresos: parseFloat(row.ingresos) || 0,
      margen: parseFloat(row.margen) || 0,
    }));
  }

  // ============================================================
  // TABLA PAGINADA: Ventas con detalle
  // ============================================================
  private async obtenerTablaVentas(
    inicio: Date,
    fin: Date,
    categoriaId?: string,
    metodoPago?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.ventaRepository.createQueryBuilder('v')
      .leftJoinAndSelect('v.vendedor', 'vendedor')
      .leftJoinAndSelect('v.detalles', 'dv')
      .leftJoinAndSelect('dv.producto', 'p')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin })
      .orderBy('v.fechaVenta', 'DESC');

    if (metodoPago) {
      query.andWhere('v.metodoPago = :metodoPago', { metodoPago });
    }
    if (categoriaId) {
      // Sub-query: ventas que tienen al menos un producto de esta categoría
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('dv_sub.venta_id')
          .from(DetalleVenta, 'dv_sub')
          .innerJoin('dv_sub.producto', 'p_sub')
          .where('p_sub.categoria_id = :catId')
          .getQuery();
        return `v.id IN ${subQuery}`;
      }).setParameter('catId', categoriaId);
    }

    // Contar total antes de paginar
    const total = await query.getCount();

    // Paginar
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Mapear para respuesta limpia
    const rows = data.map(v => ({
      id: v.id,
      numeroVenta: v.numeroVenta,
      fecha: v.fechaVenta,
      clienteNombre: v.clienteNombre || 'Consumidor Final',
      clienteDocumento: v.clienteDocumento || '-',
      subtotal: Number(v.subtotal),
      descuento: Number(v.descuentoTotal),
      total: Number(v.total),
      metodoPago: v.metodoPago,
      estado: v.estado,
      vendedor: v.vendedor ? `${v.vendedor.nombre || ''} ${v.vendedor.apellido || ''}`.trim() : '-',
      cantidadProductos: v.detalles ? v.detalles.reduce((acc, d) => acc + Number(d.cantidad), 0) : 0,
      productos: v.detalles ? v.detalles.map(d => ({
        nombre: d.producto?.nombre || 'Producto',
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
        subtotal: Number(d.subtotal),
      })) : [],
    }));

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // EXPORTACIÓN CSV: Datos planos para descarga
  // ============================================================
  async getExportData(filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    categoriaId?: string;
    metodoPago?: string;
  }) {
    const now = new Date();
    const fin = filtros.fechaFin
      ? new Date(filtros.fechaFin + 'T23:59:59.999')
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const inicio = filtros.fechaInicio
      ? new Date(filtros.fechaInicio + 'T00:00:00')
      : (() => { const d = new Date(fin); d.setDate(d.getDate() - 30); d.setHours(0, 0, 0, 0); return d; })();

    const query = this.ventaRepository.createQueryBuilder('v')
      .leftJoinAndSelect('v.vendedor', 'vendedor')
      .leftJoinAndSelect('v.detalles', 'dv')
      .leftJoinAndSelect('dv.producto', 'p')
      .where('v.estado = :estado', { estado: SaleStatus.COMPLETADA })
      .andWhere('v.fechaVenta BETWEEN :inicio AND :fin', { inicio, fin })
      .orderBy('v.fechaVenta', 'DESC');

    if (filtros.metodoPago) {
      query.andWhere('v.metodoPago = :metodoPago', { metodoPago: filtros.metodoPago });
    }
    if (filtros.categoriaId) {
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('dv_sub.venta_id')
          .from(DetalleVenta, 'dv_sub')
          .innerJoin('dv_sub.producto', 'p_sub')
          .where('p_sub.categoria_id = :catId')
          .getQuery();
        return `v.id IN ${subQuery}`;
      }).setParameter('catId', filtros.categoriaId);
    }

    const ventas = await query.getMany();

    // Mapear a filas planas para CSV
    const rows = ventas.map(v => ({
      numeroVenta: v.numeroVenta,
      fecha: new Date(v.fechaVenta).toLocaleDateString('es-BO'),
      cliente: v.clienteNombre || 'Consumidor Final',
      documento: v.clienteDocumento || '-',
      subtotal: Number(v.subtotal).toFixed(2),
      descuento: Number(v.descuentoTotal).toFixed(2),
      total: Number(v.total).toFixed(2),
      metodoPago: v.metodoPago,
      estado: v.estado,
      vendedor: v.vendedor ? `${v.vendedor.nombre || ''} ${v.vendedor.apellido || ''}`.trim() : '-',
      productos: v.detalles ? v.detalles.map(d => `${d.producto?.nombre || 'N/A'}(x${d.cantidad})`).join('; ') : '',
    }));

    return {
      headers: ['N° Venta', 'Fecha', 'Cliente', 'Documento', 'Subtotal', 'Descuento', 'Total', 'Método de Pago', 'Estado', 'Vendedor', 'Productos'],
      rows,
      totalRegistros: rows.length,
    };
  }

  // ============================================================
  // CATEGORÍAS: Para el dropdown de filtros
  // ============================================================
  async getCategoriasParaFiltro() {
    return this.categoriaRepository.find({
      where: { estado: 'ACTIVO' },
      select: ['id', 'nombre'],
      order: { nombre: 'ASC' },
    });
  }

  // ============================================================
  // DASHBOARD ORIGINAL (se mantiene para compatibilidad)
  // ============================================================
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
        const current = topMap.get(d.producto.id) || { nombre: d.producto.nombre, cantidadVendida: 0, ingresos: 0 };
        topMap.set(d.producto.id, {
          nombre: d.producto.nombre,
          cantidadVendida: current.cantidadVendida + Number(d.cantidad),
          ingresos: current.ingresos + Number(d.subtotal || 0)
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