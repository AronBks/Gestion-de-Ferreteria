import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoSiat } from '../entities/factura.entity';

export class FilterFacturasDto {
  @IsOptional()
  @IsEnum(EstadoSiat)
  estadoSiat?: EstadoSiat;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

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
