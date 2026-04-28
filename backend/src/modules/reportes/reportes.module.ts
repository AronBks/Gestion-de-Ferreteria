import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Venta } from '../ventas/entities/venta.entity';
import { DetalleVenta } from '../ventas/entities/detalle-venta.entity';
import { Producto } from '../productos/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, Producto])
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}