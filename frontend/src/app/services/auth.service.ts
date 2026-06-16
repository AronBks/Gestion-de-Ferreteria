import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  LoginRequest,
  LoginResponse,
  AuthState,
  User,
  Role,
  ROLE_DEFAULT_ROUTES,
} from '../models/auth.model';

/**
 * AuthService — Servicio de Autenticación con Angular Signals
 *
 * ARQUITECTURA:
 * ─────────────
 * - Signal `currentUser` como fuente única de verdad del estado.
 * - Computed signals `isLoggedIn`, `userRole` derivados automáticamente.
 * - Observable `auth$` mantenido para compatibilidad con componentes existentes
 *   (dashboard, interceptor, sidebar) — se elimina gradualmente.
 *
 * RENDIMIENTO:
 * ────────────
 * - Los Signals solo notifican cuando el valor CAMBIA (referencia diferente).
 * - No hay BehaviorSubject con suscripciones manuales que puedan causar memory leaks.
 * - `computed()` se recalcula lazily, solo cuando se lee y la dependencia cambió.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private platformId = inject(PLATFORM_ID);

  // ============================================================
  // SIGNALS — Fuente de verdad reactiva
  // ============================================================

  /** Signal principal: usuario autenticado actual */
  public currentUser = signal<User | null>(null);

  /** Signal derivado: ¿está autenticado? */
  public isLoggedIn = computed(() => !!this.currentUser());

  /** Signal derivado: rol del usuario actual */
  public userRole = computed(() => this.currentUser()?.rol ?? null);

  /** Token JWT actual (almacenado en memoria para acceso rápido) */
  private tokenSignal = signal<string | null>(null);

  // ============================================================
  // COMPATIBILIDAD — Observable para componentes legacy
  // ============================================================

  /**
   * Observable derivado del signal para componentes que aún usan auth$.
   * Se mantendrá hasta que todos los consumidores migren a Signals.
   */
  private authState = computed<AuthState>(() => ({
    token: this.tokenSignal(),
    user: this.currentUser(),
    isAuthenticated: this.isLoggedIn(),
  }));

  public auth$ = toObservable(this.authState);

  // ============================================================
  // CONSTRUCTOR — Restaurar sesión desde localStorage
  // ============================================================

  constructor(private http: HttpClient) {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user_info');

        if (token && userStr && userStr !== 'undefined') {
          const user: User = JSON.parse(userStr);
          this.tokenSignal.set(token);
          this.currentUser.set(user);
        }
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================

  /**
   * Verificar si el usuario tiene al menos uno de los roles especificados.
   * Uso: authService.hasRole(Role.ADMIN, Role.GERENTE)
   */
  public hasRole(...roles: Role[]): boolean {
    const current = this.currentUser();
    return !!current && roles.includes(current.rol);
  }

  /**
   * Obtener la ruta por defecto según el rol del usuario.
   * Usado para redirección post-login inteligente.
   */
  public getDefaultRouteForRole(role: Role): string {
    return ROLE_DEFAULT_ROUTES[role] || '/dashboard';
  }

  /** Obtener el token JWT actual */
  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /** Obtener el usuario actual (compatibilidad con código existente) */
  public getUser(): User | null {
    return this.currentUser();
  }

  /** Verificar autenticación (compatibilidad con código existente) */
  public isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ============================================================
  // LOGIN
  // ============================================================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        const token = response.access_token;
        const user = response.user;

        // Persistir en localStorage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_info', JSON.stringify(user));
        }

        // Actualizar Signals (dispara reactividad automática)
        this.tokenSignal.set(token);
        this.currentUser.set(user);
      }),
      catchError(err => {
        this.clearStorage();
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  logout(): void {
    this.clearStorage();
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  saveUserInfo(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_info', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  }
}
