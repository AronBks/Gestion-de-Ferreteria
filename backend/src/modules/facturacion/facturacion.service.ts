import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Factura, EstadoSiat, CanalEnvio } from './entities/factura.entity';
import { Venta, SaleStatus } from '../ventas/entities/venta.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { FilterFacturasDto } from './dto/filter-facturas.dto';
import { SiatService } from './siat.service';
import { EnvioFacturaService, EnvioResult } from './envio-factura.service';

// ============================================================================
// FacturacionService — Servicio Core de Facturación Electrónica
// ============================================================================
// Principios aplicados:
//   - SRP: Facturación separada de Envío y de SIAT
//   - Transaccional: QueryRunner con rollback en errores
//   - Clean Architecture: DTOs tipados, sin lógica en controller
// ============================================================================

@Injectable()
export class FacturacionService {
  private readonly logger = new Logger(FacturacionService.name);

  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
    private readonly siatService: SiatService,
    private readonly envioFacturaService: EnvioFacturaService,
  ) {}

  // --------------------------------------------------------------------------
  // EMITIR FACTURA — Transaccional con QueryRunner
  // --------------------------------------------------------------------------
  async emitirFactura(dto: CreateFacturaDto, userId: string): Promise<Factura> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que la venta existe y está completada
      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id: dto.ventaId },
        relations: ['detalles', 'detalles.producto'],
      });

      if (!venta) {
        throw new NotFoundException(`Venta con ID ${dto.ventaId} no encontrada`);
      }

      if (venta.estado !== SaleStatus.COMPLETADA) {
        throw new BadRequestException(
          `No se puede facturar una venta con estado "${venta.estado}". Solo ventas COMPLETADAS.`,
        );
      }

      // 2. Verificar que no exista ya una factura para esta venta
      const facturaExistente = await queryRunner.manager.findOne(Factura, {
        where: { ventaId: dto.ventaId },
      });

      if (facturaExistente) {
        throw new BadRequestException(
          `La venta ${venta.numeroVenta} ya tiene una factura asociada (Factura #${facturaExistente.numeroFactura})`,
        );
      }

      // 3. Obtener datos del SIAT (mock)
      const nitEmisor = this.siatService.getNitEmisor();
      const puntoVenta = dto.puntoVenta ?? 0;
      const sucursalNum = dto.sucursal ?? 0;

      const numeroFactura = await this.siatService.obtenerSiguienteNumeroFactura();

      const [cufResponse, cufdResponse, leyendaResponse] = await Promise.all([
        this.siatService.generarCUF({
          nitEmisor,
          fechaEmision: new Date(),
          sucursal: sucursalNum,
          puntoVenta,
          numeroFactura,
        }),
        this.siatService.generarCUFD({
          nitEmisor,
          sucursal: sucursalNum,
          puntoVenta,
        }),
        this.siatService.obtenerLeyenda(),
      ]);

      // 4. Actualizar teléfono del cliente en la venta si se proporcionó
      if (dto.clienteTelefono && dto.clienteTelefono !== venta.clienteTelefono) {
        venta.clienteTelefono = dto.clienteTelefono;
        await queryRunner.manager.save(Venta, venta);
      }

      // 5. Crear la factura electrónica
      const nuevaFactura = queryRunner.manager.create(Factura, {
        ventaId: dto.ventaId,
        cuf: cufResponse.cuf,
        cufd: cufdResponse.cufd,
        numeroFactura,
        fechaEmision: new Date(),
        codigoControl: cufdResponse.codigoControl,
        leyendaSiat: leyendaResponse.leyenda,
        estadoSiat: EstadoSiat.EMITIDA,
        actividadEconomica: dto.actividadEconomica || '477310',
        puntoVenta,
        sucursal: sucursalNum,
        creadoPor: userId,
      });

      const facturaGuardada = await queryRunner.manager.save(Factura, nuevaFactura);

      // 6. Commit transaccional
      await queryRunner.commitTransaction();

      this.logger.log(
        `[Facturación] Factura #${numeroFactura} emitida para venta ${venta.numeroVenta} (CUF: ${cufResponse.cuf.substring(0, 16)}...)`,
      );

      // 7. Retornar factura con relaciones
      const facturaCompleta = await this.facturaRepository.findOne({
        where: { id: facturaGuardada.id },
        relations: ['venta', 'venta.vendedor', 'venta.detalles', 'venta.detalles.producto'],
      });

      return facturaCompleta!;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`[Facturación] Error al emitir factura: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --------------------------------------------------------------------------
  // ANULAR FACTURA — Transaccional
  // --------------------------------------------------------------------------
  async anularFactura(facturaId: string, motivo: string): Promise<Factura> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const factura = await queryRunner.manager.findOne(Factura, {
        where: { id: facturaId },
        relations: ['venta'],
      });

      if (!factura) {
        throw new NotFoundException(`Factura con ID ${facturaId} no encontrada`);
      }

      if (factura.estadoSiat === EstadoSiat.ANULADA) {
        throw new BadRequestException('La factura ya se encuentra anulada');
      }

      if (factura.estadoSiat !== EstadoSiat.EMITIDA) {
        throw new BadRequestException(
          `Solo se pueden anular facturas con estado EMITIDA. Estado actual: ${factura.estadoSiat}`,
        );
      }

      // Actualizar estado de la factura
      factura.estadoSiat = EstadoSiat.ANULADA;
      factura.motivoAnulacion = motivo || 'Anulación solicitada por el usuario';
      factura.fechaAnulacion = new Date();

      const facturaAnulada = await queryRunner.manager.save(Factura, factura);

      await queryRunner.commitTransaction();

      this.logger.log(
        `[Facturación] Factura #${factura.numeroFactura} ANULADA. Motivo: ${motivo}`,
      );

      return facturaAnulada;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER FACTURA POR VENTA
  // --------------------------------------------------------------------------
  async obtenerFacturaPorVenta(ventaId: string): Promise<Factura | null> {
    return this.facturaRepository.findOne({
      where: { ventaId },
      relations: ['venta', 'venta.vendedor'],
    });
  }

  // --------------------------------------------------------------------------
  // OBTENER FACTURA POR ID
  // --------------------------------------------------------------------------
  async obtenerFacturaPorId(facturaId: string): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['venta', 'venta.vendedor', 'venta.detalles', 'venta.detalles.producto'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${facturaId} no encontrada`);
    }

    return factura;
  }

  // --------------------------------------------------------------------------
  // LISTAR FACTURAS — Paginado con filtros
  // --------------------------------------------------------------------------
  async listarFacturas(filterDto: FilterFacturasDto) {
    const { estadoSiat, fechaInicio, fechaFin, page = 1, limit = 10 } = filterDto;

    const query = this.facturaRepository
      .createQueryBuilder('factura')
      .leftJoinAndSelect('factura.venta', 'venta')
      .leftJoinAndSelect('venta.vendedor', 'vendedor')
      .orderBy('factura.fechaEmision', 'DESC');

    if (estadoSiat) {
      query.andWhere('factura.estadoSiat = :estadoSiat', { estadoSiat });
    }

    if (fechaInicio) {
      query.andWhere('factura.fechaEmision >= :fechaInicio', { fechaInicio });
    }

    if (fechaFin) {
      query.andWhere('factura.fechaEmision <= :fechaFin', { fechaFin });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --------------------------------------------------------------------------
  // ENVIAR FACTURA — Delegado a EnvioFacturaService
  // --------------------------------------------------------------------------
  async enviarFactura(
    facturaId: string,
    canal: CanalEnvio,
    destino?: string,
  ): Promise<EnvioResult> {
    // Verificar que la factura existe y está emitida
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${facturaId} no encontrada`);
    }

    if (factura.estadoSiat !== EstadoSiat.EMITIDA) {
      throw new BadRequestException(
        `Solo se pueden enviar facturas con estado EMITIDA. Estado actual: ${factura.estadoSiat}`,
      );
    }

    return this.envioFacturaService.enviarFactura(facturaId, canal, destino);
  }
}
