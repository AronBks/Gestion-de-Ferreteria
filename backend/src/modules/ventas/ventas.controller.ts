import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear nueva venta (POS)' })
  create(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    return this.ventasService.create(createVentaDto, req.user.id);
  }

  @Get('resumen/hoy')
  @ApiOperation({ summary: 'Resumen de ventas del día actual' })
  getResumenHoy() {
    return this.ventasService.getResumenHoy();
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con filtros y paginación' })
  findAll(@Query() filterDto: FilterVentasDto) {
    return this.ventasService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalle de una venta por ID' })
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Cancelar una venta (devuelve stock)' })
  cancelar(@Param('id') id: string) {
    return this.ventasService.cancelar(id);
  }
}
