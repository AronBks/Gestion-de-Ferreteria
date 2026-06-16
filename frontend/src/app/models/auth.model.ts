/**
 * Modelo de Autenticación — Sistema RBAC Ferretería
 *
 * Enum Role sincronizado con UserRole del backend (usuario.entity.ts).
 * Cualquier cambio en los roles del backend debe reflejarse aquí.
 */

// ============================================================
// ENUM DE ROLES — Fuente única de verdad para el frontend
// ============================================================
export enum Role {
  ADMIN      = 'ADMIN',
  GERENTE    = 'GERENTE',
  VENDEDOR   = 'VENDEDOR',
  ALMACENERO = 'ALMACENERO',
  AUDITOR    = 'AUDITOR',
}

// ============================================================
// INTERFACES DE USUARIO
// ============================================================
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Role;
}

// ============================================================
// INTERFACES DE AUTENTICACIÓN
// ============================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ============================================================
// MAPAS DE CONFIGURACIÓN POR ROL
// ============================================================

/**
 * Ruta por defecto post-login según el rol del usuario.
 * ADMIN/GERENTE/AUDITOR → Dashboard estadístico
 * VENDEDOR → POS directo
 * ALMACENERO → Inventario
 */
export const ROLE_DEFAULT_ROUTES: Record<Role, string> = {
  [Role.ADMIN]:      '/dashboard',
  [Role.GERENTE]:    '/dashboard',
  [Role.AUDITOR]:    '/dashboard',
  [Role.VENDEDOR]:   '/dashboard/ventas/nueva',
  [Role.ALMACENERO]: '/dashboard/productos',
};

/**
 * Etiquetas legibles para mostrar en la UI.
 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]:      'Administrador',
  [Role.GERENTE]:    'Gerente',
  [Role.VENDEDOR]:   'Vendedor',
  [Role.ALMACENERO]: 'Almacenero',
  [Role.AUDITOR]:    'Auditor',
};
