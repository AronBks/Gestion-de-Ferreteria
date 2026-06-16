import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Role } from './models/auth.model';

/**
 * Rutas del Sistema — RBAC aplicado con Guards Funcionales
 *
 * authGuard:  Verifica autenticación (JWT válido en sesión)
 * roleGuard:  Verifica autorización (rol del usuario vs roles permitidos en data)
 *
 * Matriz de acceso por ruta:
 * ─────────────────────────────────────────────────────────────
 * /dashboard            → ADMIN, GERENTE, AUDITOR
 * /dashboard/productos  → ADMIN, GERENTE, VENDEDOR, ALMACENERO, AUDITOR (todos)
 * /dashboard/ventas     → ADMIN, GERENTE, VENDEDOR, AUDITOR
 * /dashboard/usuarios   → ADMIN, GERENTE, AUDITOR
 * /dashboard/reportes   → ADMIN, GERENTE, AUDITOR
 * /forbidden            → Página 403 (accesible para todos)
 * /login                → Público
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.GERENTE, Role.AUDITOR] },
      },
      {
        path: 'productos',
        component: ProductosComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.GERENTE, Role.VENDEDOR, Role.ALMACENERO, Role.AUDITOR] },
      },
      {
        path: 'ventas',
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.GERENTE, Role.VENDEDOR, Role.AUDITOR] },
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.GERENTE, Role.AUDITOR] },
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.GERENTE, Role.AUDITOR] },
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
