import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { CreateUsuarioPayload, Usuario, UserRole, UserStatus } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, StatusBadgeComponent, HasRoleDirective, ConfirmDialogComponent],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto flex flex-col gap-6">
      <app-page-header 
        title="Gestión de Usuarios" 
        subtitle="Administra el equipo y sus roles" 
        icon="group"
        actionLabel="+ Nuevo Usuario"
        (action)="abrirFormulario()"
      ></app-page-header>

      <!-- Fila de Filtros -->
      <div class="flex flex-wrap items-center gap-4 bg-surface p-4 rounded-xl border border-border dark:bg-gray-800 dark:border-gray-700">
        <div class="relative max-w-xs w-full">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por nombre o email..." class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <div class="flex gap-2">
          @for (r of ['ADMIN', 'GERENTE', 'VENDEDOR', 'ALMACENERO', 'AUDITOR']; track r) {
            <button 
              (click)="toggleFiltroRol(r)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border"
              [ngClass]="filtroRol() === r ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-400' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'"
            >
              {{ r }}
            </button>
          }
          <button 
            *ngIf="filtroRol() !== ''"
            (click)="toggleFiltroRol('')"
            class="px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            x Quitar filtro
          </button>
        </div>

        <label class="flex items-center gap-2 ml-auto text-sm font-medium text-gray-600 dark:text-gray-300">
          <input type="checkbox" [(ngModel)]="soloActivos" class="rounded text-amber-500 focus:ring-amber-500 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600">
          Solo activos
        </label>
      </div>

      <!-- Grid Visual de Usuarios -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @if (loading()) {
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-surface rounded-xl p-6 border border-border dark:bg-gray-800 dark:border-gray-700 h-48 animate-pulse"></div>
          }
        } @else {
          @for (u of usuariosFiltrados(); track u.id) {
            <div class="bg-surface rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative group dark:bg-gray-800 dark:border-gray-700 flex flex-col">
              
              <!-- User Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-lg font-bold shadow-inner">
                    {{ u.nombre.charAt(0) }}{{ u.apellido.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="font-heading font-bold text-gray-900 dark:text-white leading-tight">
                      {{ u.nombre }} {{ u.apellido }}
                    </h3>
                    <p class="text-xs text-gray-500 truncate w-32 md:w-40" [title]="u.email">{{ u.email }}</p>
                  </div>
                </div>

                <div class="relative" *hasRole="['ADMIN']">
                  <!-- Solo mostramos botón si no soy yo mimismo -->
                  @if (u.id !== authService.getUser()?.sub && u.id !== authService.getUser()?.id) {
                    <button (click)="openMenuObj = u.id" class="text-gray-400 hover:text-gray-800 p-1 dark:hover:text-white focus:outline-none">
                      <span class="material-icons text-sm">more_vert</span>
                    </button>
                    <!-- Dropdown Acciones -->
                    @if (openMenuObj === u.id) {
                      <div class="absolute right-0 top-6 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-10" (mouseleave)="openMenuObj = null">
                        
                        <button (click)="resetearClave(u); openMenuObj = null" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2">
                          <span class="material-icons text-[16px]">key</span> Clave
                        </button>
                        
                        <button (click)="cambiarEstado(u); openMenuObj = null" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2">
                          <span class="material-icons text-[16px]">power_settings_new</span> 
                          {{ u.estado === 'ACTIVO' ? 'Suspender' : 'Activar' }}
                        </button>
                        
                        <div class="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                        
                        <button (click)="confirmarEliminar(u); openMenuObj = null" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
                          <span class="material-icons text-[16px]">delete</span> Eliminar
                        </button>

                      </div>
                    }
                  }
                </div>
              </div>

              <!-- Roles & Badges -->
              <div class="flex items-center gap-2 mb-4">
                <app-status-badge [status]="u.rol" [type]="getRolBadgeColor(u.rol)"></app-status-badge>
                <div class="w-2 h-2 rounded-full" [ngClass]="u.estado === 'ACTIVO' ? 'bg-green-500 animate-pulse' : 'bg-red-500'" [title]="u.estado"></div>
              </div>

              <!-- Extra Info -->
              <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-2">
                <div>
                  <span class="block font-semibold mb-0.5">Documento</span>
                  {{ u.tipoDocumento }}: {{ u.numeroDocumento }}
                </div>
                <div>
                  <span class="block font-semibold mb-0.5">Último Acceso</span>
                  {{ u.fechaUltimoAcceso ? (u.fechaUltimoAcceso | date:'shortDate') : 'Nunca' }}
                </div>
              </div>

            </div>
          }
        }
      </div>

      @if (!loading() && usuariosFiltrados().length === 0) {
        <div class="py-12 bg-surface border border-dashed rounded-xl dark:bg-gray-800 text-center text-gray-500">
          No hay usuarios activos que coincidan con la búsqueda.
        </div>
      }

      <!-- MODAL CREACIÓN (Muy Básico Customizado) -->
      @if (formAbierto) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 class="text-xl font-bold font-heading dark:text-white">Nuevo Usuario</h2>
              <button (click)="formAbierto = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <span class="material-icons">close</span>
              </button>
            </div>

            <div class="p-6">
              <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" #f="ngForm" (ngSubmit)="guardarUsuario(f.value)">
                
                <div>
                  <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Nombre</label>
                  <input type="text" ngModel name="nombre" required class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2 focus:ring-amber-500">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Apellido</label>
                  <input type="text" ngModel name="apellido" required class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2 focus:ring-amber-500">
                </div>

                <div>
                  <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Email</label>
                  <input type="email" ngModel name="email" required email class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2 focus:ring-amber-500">
                </div>
                
                <div class="grid grid-cols-3 gap-2">
                  <div class="col-span-1">
                    <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Doc.</label>
                    <select ngModel="DNI" name="tipoDocumento" class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2">
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                      <option value="PASAPORTE">PAS</option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs font-semibold mb-1 dark:text-gray-300">N° Documento</label>
                    <input type="text" ngModel name="numeroDocumento" required class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Rol Sistema</label>
                  <select ngModel="VENDEDOR" name="rol" class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2 focus:ring-amber-500">
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="ALMACENERO">Almacenero</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs font-semibold mb-1 dark:text-gray-300">Teléfono (Opc.)</label>
                  <input type="text" ngModel name="telefono" class="w-full rounded-md border-gray-300 dark:bg-gray-700 py-2">
                </div>

                <div class="col-span-1 sm:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" (click)="formAbierto = false" class="px-4 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                  <button type="submit" [disabled]="f.invalid" class="px-5 py-2 font-bold text-white bg-amber-500 rounded-lg shadow disabled:opacity-50 hover:bg-amber-600 flex items-center gap-2">
                    <span class="material-icons text-sm">save</span> Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="confirmModalOpen"
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? No podrá volver a ingresar al sistema."
        type="danger"
        confirmText="Sí, eliminar"
        (confirm)="ejecutarEliminar()"
        (close)="confirmModalOpen = false"
      ></app-confirm-dialog>

    </div>
  `
})
export class ListaUsuariosComponent implements OnInit {
  public usuariosService = inject(UsuariosService);
  public authService = inject(AuthService);
  public toast = inject(ToastService);

  usuarios = signal<Usuario[]>([]);
  loading = signal<boolean>(false);
  
  // State 
  searchTerm = '';
  filtroRol = signal<string>('');
  soloActivos = true;
  openMenuObj: string | null = null;
  
  // Modal Crear
  formAbierto = false;

  // Modal Confirmar
  confirmModalOpen = false;
  usuarioAEliminar: string | null = null;

  usuariosFiltrados = computed(() => {
    let result = this.usuarios();
    
    if (this.filtroRol()) {
      result = result.filter(u => u.rol === this.filtroRol());
    }
    
    if (this.soloActivos) {
      result = result.filter(u => u.estado === 'ACTIVO');
    }

    if (this.searchTerm.trim() !== '') {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.nombre + ' ' + u.apellido).toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }
    
    return result;
  });

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.usuariosService.findAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  abrirFormulario() {
    this.formAbierto = true;
  }

  guardarUsuario(val: any) {
    const payload: CreateUsuarioPayload = {
      ...val,
      estado: 'ACTIVO' as UserStatus
    };
    this.usuariosService.create(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Usuario creado. La contraseña aleatoria aplicó correctamente.');
        this.formAbierto = false;
        this.cargarUsuarios();
      }
    });
  }

  toggleFiltroRol(r: string) {
    this.filtroRol.set(this.filtroRol() === r ? '' : r);
  }

  getRolBadgeColor(rol: string): any {
    const map: any = {
      'ADMIN': 'purple',
      'GERENTE': 'info',
      'VENDEDOR': 'success',
      'ALMACENERO': 'warning',
      'AUDITOR': 'neutral'
    };
    return map[rol] || 'neutral';
  }

  cambiarEstado(u: Usuario) {
    const newStatus = u.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    this.usuariosService.updateEstado(u.id, newStatus).subscribe(() => {
      this.toast.showSuccess(`Usuario ${newStatus.toLowerCase()}`);
      this.cargarUsuarios();
    });
  }

  resetearClave(u: Usuario) {
    this.usuariosService.resetPassword(u.id).subscribe(res => {
      this.toast.showSuccess(`Contraseña reseteada. Temporal: ${res.temporal} (enviar a usuario)`);
    });
  }

  confirmarEliminar(u: Usuario) {
    this.usuarioAEliminar = u.id;
    this.confirmModalOpen = true;
  }

  ejecutarEliminar() {
    if (this.usuarioAEliminar) {
      this.usuariosService.remove(this.usuarioAEliminar).subscribe(() => {
        this.toast.showSuccess('Usuario eliminado exitosamente.');
        this.confirmModalOpen = false;
        this.cargarUsuarios();
      });
    }
  }
}