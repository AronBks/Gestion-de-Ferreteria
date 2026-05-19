import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';
import { SiatService } from './siat.service';
import { EnvioFacturaService } from './envio-factura.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, Venta]),
  ],
  controllers: [FacturacionController],
  providers: [
    FacturacionService,
    SiatService,
    EnvioFacturaService,
  ],
  exports: [FacturacionService, SiatService],
})
export class FacturacionModule {}
