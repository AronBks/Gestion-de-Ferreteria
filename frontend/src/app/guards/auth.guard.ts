import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) { }

  canActivate(): boolean {
    // TODO: En producción, validar token real
    // Por ahora, permitir acceso para testing
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      
      // Si no hay token, crear uno temporal para testing
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.setItem('auth_token', 'test_token_' + Date.now());
        return true;
      }
      
      return true;
    }

    return true;
  }
}
