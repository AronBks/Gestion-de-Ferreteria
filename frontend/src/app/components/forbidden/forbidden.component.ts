import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ROLE_DEFAULT_ROUTES, ROLE_LABELS } from '../../models/auth.model';

/**
 * ForbiddenComponent — Página 403 Acceso Denegado.
 *
 * Se muestra cuando un usuario autenticado intenta acceder a una ruta
 * para la cual su rol no tiene permiso. Ofrece:
 * - Retroalimentación visual clara del error
 * - Información del rol actual del usuario
 * - Botón para ir a su dashboard correspondiente
 * - Botón para cerrar sesión
 */
@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <!-- Ícono animado -->
        <div class="icon-container">
          <div class="shield-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
        </div>

        <!-- Código de error -->
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Acceso Denegado</h2>
        <p class="error-message">
          No tienes permisos para acceder a esta sección.
          Tu rol actual es <strong class="role-badge">{{ currentRoleLabel }}</strong>.
        </p>

        <!-- Acciones -->
        <div class="actions">
          <button class="btn-primary" (click)="goToMyDashboard()">
            <span class="btn-icon">🏠</span>
            Ir a Mi Panel
          </button>
          <button class="btn-secondary" (click)="logout()">
            <span class="btn-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Fondo decorativo -->
      <div class="bg-decoration"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }

    .forbidden-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: var(--color-bg-primary, #0f172a);
      position: relative;
      overflow: hidden;
    }

    .forbidden-card {
      text-align: center;
      padding: 3rem 2.5rem;
      border-radius: 20px;
      background: var(--color-bg-secondary, #1e293b);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
      max-width: 480px;
      width: 90%;
      z-index: 2;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ========== ÍCONO ========== */
    .icon-container {
      margin-bottom: 1.5rem;
    }

    .shield-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      animation: pulse 2s ease-in-out infinite;
    }

    /* ========== TEXTO ========== */
    .error-code {
      font-size: 4.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #ef4444, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary, #f1f5f9);
      margin: 0.5rem 0;
    }

    .error-message {
      font-size: 1rem;
      color: var(--color-text-secondary, #94a3b8);
      line-height: 1.6;
      margin: 1rem 0 2rem;
    }

    .role-badge {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      font-weight: 600;
      font-size: 0.9rem;
    }

    /* ========== BOTONES ========== */
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #1e293b;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.35);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-secondary, #94a3b8);
      border: 1px solid var(--color-border, rgba(255,255,255,0.1));
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary, #f1f5f9);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    /* ========== FONDO DECORATIVO ========== */
    .bg-decoration {
      position: absolute;
      top: -30%;
      right: -20%;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.06), transparent 70%);
      z-index: 1;
      pointer-events: none;
    }

    /* ========== ANIMACIONES ========== */
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 480px) {
      .forbidden-card {
        padding: 2rem 1.5rem;
      }
      .error-code {
        font-size: 3.5rem;
      }
      .shield-icon {
        width: 100px;
        height: 100px;
      }
      .shield-icon svg {
        width: 60px;
        height: 60px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .forbidden-card,
      .shield-icon {
        animation: none !important;
      }
    }
  `]
})
export class ForbiddenComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentRoleLabel(): string {
    const role = this.authService.userRole();
    return role ? (ROLE_LABELS[role] || role) : 'No definido';
  }

  goToMyDashboard(): void {
    const role = this.authService.userRole();
    if (role) {
      const route = ROLE_DEFAULT_ROUTES[role];
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
