import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'productos',
        component: ProductosComponent
      },
      {
        path: 'ventas',
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

