import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateFacturaDto {
  @IsUUID()
  ventaId: string;

  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  actividadEconomica?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  puntoVenta?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sucursal?: number;
}
