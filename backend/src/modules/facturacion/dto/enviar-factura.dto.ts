import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CanalEnvio } from '../entities/factura.entity';

export class EnviarFacturaDto {
  @IsUUID()
  facturaId: string;

  @IsEnum(CanalEnvio)
  canal: CanalEnvio;

  @IsOptional()
  @IsString()
  destino?: string; // Teléfono o email según el canal
}
