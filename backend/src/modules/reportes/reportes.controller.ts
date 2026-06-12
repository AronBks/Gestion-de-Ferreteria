import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // ============================================================
  // GET /reportes/dashboard — Dashboard original (compatibilidad)
  // ============================================================
  @Get('dashboard')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Obtener métricas y KPIs del Dashboard' })
  getDashboardStats(@Query('dias') dias?: string) {
    const d = dias ? parseInt(dias) : 30; // Por defecto últimos 30 días
    return this.reportesService.getDashboardStats(d);
  }

  // ============================================================
  // GET /reportes/modulo — Módulo de Reportes con filtros avanzados
  // ============================================================
  @Get('modulo')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Datos completos del módulo de Reportes y Estadísticas' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'categoriaId', required: false, description: 'ID de categoría' })
  @ApiQuery({ name: 'metodoPago', required: false, description: 'Método de pago' })
  @ApiQuery({ name: 'page', required: false, description: 'Página de la tabla' })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página' })
  getReportesData(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('metodoPago') metodoPago?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportesService.getReportesData({
      fechaInicio,
      fechaFin,
      categoriaId,
      metodoPago,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // ============================================================
  // GET /reportes/exportar — Datos para exportación CSV
  // ============================================================
  @Get('exportar')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Exportar datos de ventas en formato para CSV' })
  @ApiQuery({ name: 'fechaInicio', required: false })
  @ApiQuery({ name: 'fechaFin', required: false })
  @ApiQuery({ name: 'categoriaId', required: false })
  @ApiQuery({ name: 'metodoPago', required: false })
  getExportData(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('metodoPago') metodoPago?: string,
  ) {
    return this.reportesService.getExportData({
      fechaInicio,
      fechaFin,
      categoriaId,
      metodoPago,
    });
  }

  // ============================================================
  // GET /reportes/categorias — Categorías para dropdown de filtros
  // ============================================================
  @Get('categorias')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Obtener categorías para filtro de reportes' })
  getCategorias() {
    return this.reportesService.getCategoriasParaFiltro();
  }
}