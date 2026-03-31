import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  // Obtener Token
  const token = authService.getToken();
  
  // Clonar request con token
  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) 
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo de errores global
      let errorMsg = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMsg = error.error.message;
      } else {
        // Errores desde el backend
        if (error.status === 401) {
          errorMsg = 'Sesión expirada o no autorizada';
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          errorMsg = 'No tienes permisos para esta acción';
        } else if (error.status === 500) {
          errorMsg = 'Error interno del servidor';
        } else if (error.error?.message) {
          // Extraer mensaje del validation pipe de NestJS o similar
          errorMsg = Array.isArray(error.error.message) 
            ? error.error.message[0] 
            : error.error.message;
        }
      }

      // Mostrar toast nunca crash silencioso
      toastService.showError(errorMsg);
      
      return throwError(() => error);
    })
  );
};