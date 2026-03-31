import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Obtener métricas y KPIs del Dashboard' })
  getDashboardStats(@Query('dias') dias?: string) {
    const d = dias ? parseInt(dias) : 30; // Por defecto últimos 30 días
    return this.reportesService.getDashboardStats(d);
  }
}