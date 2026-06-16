import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

/**
 * roleGuard — Guard funcional de autorización por rol (CanActivateFn).
 *
 * Lee los roles permitidos desde `route.data['roles']` y verifica
 * que el usuario autenticado tenga al menos uno de esos roles.
 *
 * Uso en rutas:
 *   {
 *     path: 'reportes',
 *     canActivate: [roleGuard],
 *     data: { roles: [Role.ADMIN, Role.GERENTE, Role.AUDITOR] }
 *   }
 *
 * Si no autenticado → /login
 * Si autenticado pero sin rol permitido → /forbidden
 * Si no hay roles definidos en data → acceso libre (solo requiere autenticación)
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar autenticación
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Leer roles permitidos desde metadata de la ruta
  const allowedRoles = route.data?.['roles'] as Role[] | undefined;

  // 3. Si no hay roles definidos, acceso libre (solo requiere auth)
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // 4. Verificar que el usuario tenga uno de los roles permitidos
  if (authService.hasRole(...allowedRoles)) {
    return true;
  }

  // 5. Sin permiso → página 403
  router.navigate(['/forbidden']);
  return false;
};
