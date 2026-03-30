import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
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
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'productos',
        component: ProductosComponent
      },
      {
        path: 'ventas',
        component: PlaceholderComponent
      },
      {
        path: 'usuarios',
        component: PlaceholderComponent
      },
      {
        path: 'reportes',
        component: PlaceholderComponent
      },
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

