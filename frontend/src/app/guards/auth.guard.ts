import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard — Guard funcional de autenticación (CanActivateFn).
 *
 * Reemplaza el AuthGuard basado en clase que generaba tokens falsos.
 * Ahora verifica autenticación real a través del Signal `isLoggedIn`.
 *
 * Uso en rutas:
 *   canActivate: [authGuard]
 *
 * Si no hay sesión activa → redirige a /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Sin sesión → redirigir al login
  router.navigate(['/login']);
  return false;
};
