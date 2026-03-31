import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserStatus } from '../usuario.entity';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}

export class UpdateUsuarioEstadoDto {
  @IsEnum(UserStatus)
  estado: UserStatus;
}
