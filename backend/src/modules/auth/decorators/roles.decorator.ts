import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../usuarios/usuario.entity';

/**
 * Clave de metadatos para el sistema RBAC.
 * Usada internamente por RolesGuard para leer los roles requeridos.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles() — Type-safe con el enum UserRole.
 *
 * Uso:
 *   @Roles(UserRole.ADMIN, UserRole.GERENTE)
 *   @Get('dashboard')
 *   getDashboard() { ... }
 *
 * Marca un endpoint con los roles que tienen acceso.
 * El RolesGuard lee estos metadatos y bloquea con 403
 * si el usuario autenticado no tiene uno de los roles permitidos.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);