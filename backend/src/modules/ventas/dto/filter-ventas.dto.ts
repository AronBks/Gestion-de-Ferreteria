import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleStatus, PaymentMethod } from '../entities/venta.entity';

export class FilterVentasDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsEnum(SaleStatus)
  estado?: SaleStatus;

  @IsOptional()
  @IsString()
  vendedorId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  metodoPago?: PaymentMethod;

  @IsOptional()
  @IsString()
  estadoFactura?: string; // EstadoSiat: EMITIDA, ANULADA, RECHAZADA, PENDIENTE, OBSERVADA

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
