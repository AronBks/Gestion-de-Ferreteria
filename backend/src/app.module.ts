import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './database';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ProductosModule } from './modules/productos/productos.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(
      typeOrmAsyncConfig(new ConfigService()),
    ),
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    ProductosModule,
    VentasModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
