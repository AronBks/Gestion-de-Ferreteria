import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { FilterVentasDto } from './dto/filter-ventas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva venta (POS)' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    try {
      console.log(`[CREATE VENTA] Usuario: ${req.user.id}, Payload:`, createVentaDto);
      return await this.ventasService.create(createVentaDto, req.user.id);
    } catch (error) {
      console.error('[CREATE VENTA ERROR]', error.message);
      throw error;
    }
  }

  @Get('resumen/hoy')
  @ApiOperation({ summary: 'Resumen de ventas del día actual' })
  async getResumenHoy() {
    return this.ventasService.getResumenHoy();
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  async findAll(@Query() filterDto: FilterVentasDto) {
    return this.ventasService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalle de una venta por ID' })
  async findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Cancelar una venta (devuelve stock)' })
  async cancelar(@Param('id') id: string) {
    return this.ventasService.cancelar(id);
  }
}
