import { IsString, IsNumber, IsOptional, Min, IsIn, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  codigo_producto?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio_venta?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio_costo?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_actual?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  // ✅ ARREGLADO: categoria_id puede ser opcional, pero si se envía debe ser UUID válido
  @IsUUID('4', { message: 'categoria_id debe ser un UUID válido' })
  @IsOptional()
  categoria_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'DESCONTINUADO', 'activo', 'inactivo', 'descontinuado'], {
    message: 'estado debe ser: ACTIVO, INACTIVO o DESCONTINUADO'
  })
  @Transform(({ value }) => value ? value.toUpperCase() : value)
  estado?: string;

  @IsNumber()
  @IsOptional()
  margen_ganancia?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  codigo_barras?: string;

  @IsString()
  @IsOptional()
  unidad_medida?: string;

  @IsNumber()
  @IsOptional()
  stock_minimo?: number;

  @IsNumber()
  @IsOptional()
  stock_maximo?: number;

  @IsString()
  @IsOptional()
  imagen_url?: string;
}

