import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_actual?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  categoria_id?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}
