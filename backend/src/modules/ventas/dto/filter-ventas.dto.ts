import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
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
  page?: number;

  @IsOptional()
  limit?: number;
}
