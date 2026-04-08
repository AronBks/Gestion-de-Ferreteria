import { IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/venta.entity';

export class CreateDetalleVentaDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoItem?: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @IsOptional()
  @IsString()
  clienteDocumento?: string;

  @IsString()
  tipoComprobante: 'FACTURA' | 'BOLETA' | 'TICKET';

  @IsEnum(PaymentMethod)
  metodoPago: PaymentMethod;

  @IsNumber()
  @Min(0)
  montoPagado: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoTotal?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  items: CreateDetalleVentaDto[];
}
