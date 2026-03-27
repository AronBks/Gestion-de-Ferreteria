import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductoDto {
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

  @IsString()
  @IsOptional()
  estado?: string;
}

