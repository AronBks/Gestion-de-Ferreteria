import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/reportes-dashboard/reportes-dashboard.component')
      .then(m => m.ReportesDashboardComponent)
  }
];