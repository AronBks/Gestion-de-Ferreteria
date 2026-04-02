import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between } from 'typeorm';
import { SaleStatus, Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { FilterVentasDto } from './dto/filter-ventas.dto';
import { Producto } from '../productos/producto.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotalCalculado = 0;
      const detallesToSave: any[] = [];

      for (const item of createVentaDto.items) {
        const producto = await queryRunner.manager.findOne(Producto, { where: { id: item.productoId } });
        if (!producto || producto.stock_actual < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para el producto ${producto?.nombre}`);
        }

        producto.stock_actual -= item.cantidad;
        await queryRunner.manager.save(Producto, producto);

        const subtotalItem = (item.precioUnitario * item.cantidad) - (item.descuentoItem || 0);
        subtotalCalculado += subtotalItem;

        detallesToSave.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuentoItem: item.descuentoItem || 0,
          subtotal: subtotalItem
        });
      }

      const igv = subtotalCalculado * 0.0; // 0% Bolivia
      const total = subtotalCalculado + igv - (createVentaDto.descuentoTotal || 0);
      const vuelto = createVentaDto.montoPagado - total;

      const count = await this.ventaRepository.count();
      const numeroVenta = `VEN-${(count + 1).toString().padStart(6, '0')}`;

      const nuevaVenta = queryRunner.manager.create(Venta, {
        ...createVentaDto,
        numeroVenta,
        vendedorId: userId,
        creadoPor: userId,
        subtotal: subtotalCalculado,
        igv,
        total,
        vuelto,
        estado: SaleStatus.COMPLETADA
      });

      const ventaGuardada = await queryRunner.manager.save(Venta, nuevaVenta);

      const detalles = detallesToSave.map(item => ({ ...item, ventaId: ventaGuardada.id }));
      await queryRunner.manager.insert(DetalleVenta, detalles);

      await queryRunner.commitTransaction();
      return ventaGuardada;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filterDto: FilterVentasDto) {
    const { fechaInicio, fechaFin, estado, vendedorId, metodoPago, page = 1, limit = 10 } = filterDto;
    
    const query = this.ventaRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.vendedor', 'vendedor')
      .orderBy('venta.fechaVenta', 'DESC');

    if (estado) query.andWhere('venta.estado = :estado', { estado });
    if (vendedorId) query.andWhere('venta.vendedorId = :vendedorId', { vendedorId });
    if (metodoPago) query.andWhere('venta.metodoPago = :metodoPago', { metodoPago });
    
    if (fechaInicio) query.andWhere('venta.fechaVenta >= :fechaInicio', { fechaInicio });
    if (fechaFin) query.andWhere('venta.fechaVenta <= :fechaFin', { fechaFin });

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data, total, page, limit, totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const venta = await this.ventaRepository.findOne({ 
      where: { id },
      relations: ['vendedor']
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');

    const detalles = await this.dataSource.getRepository(DetalleVenta).find({
      where: { ventaId: id },
      relations: ['producto']
    });

    return { ...venta, detalles };
  }

  async cancelar(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await queryRunner.manager.findOne(Venta, { where: { id } });
      if (!venta) throw new NotFoundException('Venta no encontrada');
      if (venta.estado === SaleStatus.CANCELADA) throw new BadRequestException('Venta ya está cancelada');

      // Restaurar stock
      const detalles = await queryRunner.manager.find(DetalleVenta, { where: { ventaId: id } });
      for (const det of detalles) {
        const producto = await queryRunner.manager.findOne(Producto, { where: { id: det.productoId } });
        if (producto) {
          producto.stock_actual += det.cantidad;
          await queryRunner.manager.save(Producto, producto);
        }
      }

      venta.estado = SaleStatus.CANCELADA;
      const result = await queryRunner.manager.save(Venta, venta);
      
      await queryRunner.commitTransaction();
      return result;
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getResumenHoy() {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const ventasHoy = await this.ventaRepository.find({
      where: {
        fechaVenta: Between(startOfDay, endOfDay),
        estado: SaleStatus.COMPLETADA
      }
    });

    const total = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);
    const transacciones = ventasHoy.length;

    // Calcular método de pago más usado
    const metodosConteo: { [key: string]: number } = {};
    ventasHoy.forEach(v => {
      metodosConteo[v.metodoPago] = (metodosConteo[v.metodoPago] || 0) + 1;
    });
    const metodoMasUsado = Object.entries(metodosConteo).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return {
      total: parseFloat(total.toFixed(2)),
      transacciones,
      metodoMasUsado,
      ticketPromedio: transacciones > 0 ? parseFloat((total/transacciones).toFixed(2)) : 0
    };
  }
}