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
    // Verificar directamente en localStorage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      
      if (token && token !== 'undefined' && token !== 'null') {
        return true;
      }
    }

    return false;
  }
}
