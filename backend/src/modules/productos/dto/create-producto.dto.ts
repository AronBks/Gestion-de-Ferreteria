import { IsString, IsNumber, IsOptional, Min, IsIn, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsString()
  codigo_producto: string;

  @IsNumber()
  @Min(0)
  precio_venta: number;

  @IsNumber()
  @Min(0)
  precio_costo: number;

  @IsUUID('4', { message: 'categoria_id debe ser un UUID válido' })
  categoria_id: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_actual?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'DESCONTINUADO', 'activo', 'inactivo', 'descontinuado'], {
    message: 'estado debe ser: ACTIVO, INACTIVO o DESCONTINUADO'
  })
  @Transform(({ value }) => value ? value.toUpperCase() : 'ACTIVO')
  estado?: string;
}
