export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono?: string;
  direccion?: string;
  rol: UserRole;
  estado: UserStatus;
  fechaUltimoAcceso?: string;
  fechaCreacion: string;
}

export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACENERO' | 'AUDITOR';
export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export interface CreateUsuarioPayload {
  email: string;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono?: string;
  direccion?: string;
  rol: UserRole;
  estado: UserStatus;
}
