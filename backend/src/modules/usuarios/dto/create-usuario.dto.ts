import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole, UserStatus, DocumentType } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El correo debe ser válido' })
  email: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEnum(DocumentType, { message: 'Tipo de documento inválido' })
  tipoDocumento: DocumentType;

  @IsString()
  numeroDocumento: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsEnum(UserRole, { message: 'Rol inválido' })
  rol: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  estado?: UserStatus;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string; // Se puede enviar o autogenerar en el backend
}
