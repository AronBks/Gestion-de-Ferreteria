import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Producto]), CategoriasModule],
  providers: [ProductosService],
  controllers: [ProductosController],
  exports: [ProductosService],
})
export class ProductosModule {}
