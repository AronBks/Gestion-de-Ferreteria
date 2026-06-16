import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../usuarios/usuario.entity';

/**
 * RolesGuard — Intercepta las peticiones y verifica que el usuario
 * autenticado tenga al menos uno de los roles requeridos por el endpoint.
 *
 * Flujo:
 * 1. Lee los roles requeridos desde los metadatos del endpoint (@Roles decorator).
 * 2. Si no hay roles definidos → acceso libre (el endpoint no tiene restricción de rol).
 * 3. Extrae el usuario del request (inyectado previamente por JwtAuthGuard/Passport).
 * 4. Compara el rol del usuario contra los roles permitidos.
 * 5. Si no coincide → lanza ForbiddenException (HTTP 403).
 *
 * IMPORTANTE: Este guard SIEMPRE debe usarse DESPUÉS de JwtAuthGuard
 * para garantizar que req.user ya existe:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leer roles requeridos del decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Si no hay @Roles() en el endpoint, permitir acceso libre
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Extraer usuario del request (ya autenticado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4. Validar existencia del usuario y su rol
    if (!user || !user.rol) {
      throw new ForbiddenException(
        'No se pudo determinar el rol del usuario. Inicie sesión nuevamente.',
      );
    }

    // 5. Verificar si el rol del usuario está en los roles permitidos
    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException(
        `Acceso denegado. Su rol (${user.rol}) no tiene permisos para este recurso. ` +
        `Roles permitidos: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}