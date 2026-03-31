import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lista-usuarios/lista-usuarios.component')
      .then(m => m.ListaUsuariosComponent)
  }
];