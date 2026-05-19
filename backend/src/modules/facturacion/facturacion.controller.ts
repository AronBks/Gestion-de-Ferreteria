import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FacturacionService } from './facturacion.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { FilterFacturasDto } from './dto/filter-facturas.dto';
import { EnviarFacturaDto } from './dto/enviar-factura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Facturación')
@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  // --------------------------------------------------------------------------
  // POST /facturacion/emitir — Emitir factura electrónica para una venta
  // --------------------------------------------------------------------------
  @Post('emitir')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emitir factura electrónica SIAT para una venta' })
  @ApiResponse({ status: 201, description: 'Factura emitida exitosamente' })
  @ApiResponse({ status: 400, description: 'Venta ya facturada o estado inválido' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async emitirFactura(@Body() dto: CreateFacturaDto, @Request() req) {
    return this.facturacionService.emitirFactura(dto, req.user.id);
  }

  // --------------------------------------------------------------------------
  // GET /facturacion — Listar facturas con filtros y paginación
  // --------------------------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Listar facturas electrónicas con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de facturas' })
  async listarFacturas(@Query() filterDto: FilterFacturasDto) {
    return this.facturacionService.listarFacturas(filterDto);
  }

  // --------------------------------------------------------------------------
  // GET /facturacion/:id — Detalle de una factura por ID
  // --------------------------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una factura por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la factura' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async obtenerFactura(@Param('id') id: string) {
    return this.facturacionService.obtenerFacturaPorId(id);
  }

  // --------------------------------------------------------------------------
  // GET /facturacion/venta/:ventaId — Obtener factura por ID de venta
  // --------------------------------------------------------------------------
  @Get('venta/:ventaId')
  @ApiOperation({ summary: 'Obtener factura asociada a una venta' })
  @ApiResponse({ status: 200, description: 'Factura de la venta o null' })
  async obtenerFacturaPorVenta(@Param('ventaId') ventaId: string) {
    return this.facturacionService.obtenerFacturaPorVenta(ventaId);
  }

  // --------------------------------------------------------------------------
  // PATCH /facturacion/:id/anular — Anular una factura emitida
  // --------------------------------------------------------------------------
  @Patch(':id/anular')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Anular una factura electrónica emitida' })
  @ApiResponse({ status: 200, description: 'Factura anulada exitosamente' })
  @ApiResponse({ status: 400, description: 'Factura no puede ser anulada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async anularFactura(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
  ) {
    return this.facturacionService.anularFactura(id, motivo);
  }

  // --------------------------------------------------------------------------
  // POST /facturacion/:id/enviar — Enviar factura al cliente
  // --------------------------------------------------------------------------
  @Post(':id/enviar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar factura al cliente por WhatsApp o Email' })
  @ApiResponse({ status: 200, description: 'Resultado del envío' })
  @ApiResponse({ status: 400, description: 'Factura no puede ser enviada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async enviarFactura(
    @Param('id') id: string,
    @Body() dto: EnviarFacturaDto,
  ) {
    return this.facturacionService.enviarFactura(id, dto.canal, dto.destino);
  }
}
