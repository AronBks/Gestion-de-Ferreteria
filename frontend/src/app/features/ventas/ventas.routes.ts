import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lista-ventas/lista-ventas.component').then(m => m.ListaVentasComponent),
    title: 'Lista de Ventas'
  },
  {
    path: 'nueva',
    loadComponent: () => import('./pages/nueva-venta/nueva-venta.component').then(m => m.NuevaVentaComponent),
    title: 'Nueva Venta'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detalle-venta/detalle-venta.component').then(m => m.DetalleVentaComponent),
    title: 'Detalle de Venta'
  }
];