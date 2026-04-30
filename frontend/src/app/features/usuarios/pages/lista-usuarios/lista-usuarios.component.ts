import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
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
    <div class="module-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-info">
          <h1>Gestión de Talento</h1>
          <p class="subtitle">Administra el equipo, roles y permisos del sistema</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="abrirFormulario()">
            <span class="material-icons">add</span>
            Añadir Nuevo Usuario
          </button>
        </div>
      </header>

      <!-- Main Data Card -->
      <section class="data-card shadow-lg">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-box">
            <span class="material-symbols-outlined icon">search</span>
            <input 
              type="text" 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event); currentPage.set(1)"
              placeholder="Buscar por nombre, email o DNI..."
            >
          </div>

          <div class="filters">
            <div class="dropdown-wrapper">
              <button class="btn-secondary" (click)="toggleRoleDropdown($event)">
                <span class="material-symbols-outlined">filter_list</span>
                {{ selectedRoles().length > 0 ? selectedRoles().join(', ') : 'Filtrar por Rol' }}
                <span class="material-symbols-outlined arrow" [class.open]="isRoleDropdownOpen()">expand_more</span>
              </button>
              
              @if (isRoleDropdownOpen()) {
                <div class="dropdown-menu animate-in">
                  <div class="menu-title">Roles disponibles</div>
                  @for (r of rolesDisponibles; track r) {
                    <label class="menu-item">
                      <input 
                        type="checkbox" 
                        [checked]="selectedRoles().includes(r)" 
                        (change)="toggleRolSelection(r)"
                      >
                      <span>{{ r }}</span>
                    </label>
                  }
                  @if (selectedRoles().length > 0) {
                    <button class="menu-clear" (click)="selectedRoles.set([])">Limpiar selección</button>
                  }
                </div>
              }
            </div>

            <label class="toggle-control">
              <input 
                type="checkbox" 
                [ngModel]="soloActivos()" 
                (ngModelChange)="onSoloActivosChange($event)"
              >
              <span class="slider"></span>
              <span class="label-text">Solo activos</span>
            </label>
          </div>
        </div>

        <!-- Table Container -->
        <div class="table-responsive">
          <table class="senior-table">
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Rol</th>
                <th>Documento</th>
                <th>Último Acceso</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="skeleton-row">
                    <td colspan="6"><div class="skeleton-line"></div></td>
                  </tr>
                }
              } @else {
                @for (u of paginatedUsuarios(); track u.id) {
                  <tr class="fade-in" [class.suspended-row]="u.estado !== 'ACTIVO'">
                    <td>
                      <div class="user-cell">
                        <div class="avatar">
                          {{ u.nombre.charAt(0) }}{{ u.apellido.charAt(0) }}
                        </div>
                        <div class="info">
                          <span class="name">
                            {{ u.nombre }} {{ u.apellido }}
                            @if (u.id === currentUser()?.id) {
                              <span class="self-tag">(Tú)</span>
                            }
                          </span>
                          <span class="email">{{ u.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-badge" [attr.data-role]="u.rol">
                        {{ u.rol }}
                      </span>
                    </td>
                    <td>
                      <div class="doc-info">
                        <span class="type">{{ u.tipoDocumento }}</span>
                        <span class="number">{{ u.numeroDocumento }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="date-text">
                        {{ u.fechaUltimoAcceso ? (u.fechaUltimoAcceso | date:'dd MMM yyyy, HH:mm') : 'Nunca' }}
                      </span>
                    </td>
                    <td>
                      <div class="status-indicator">
                        <span class="dot" [class.active]="u.estado === 'ACTIVO'"></span>
                        <span class="text">{{ u.estado }}</span>
                      </div>
                    </td>
                    <td class="text-right">
                      <div class="actions">
                        <button 
                          class="btn-icon active-icon" 
                          (click)="resetearClave(u)" 
                          title="Resetear Clave"
                        >
                          <span class="material-symbols-outlined">key</span>
                        </button>
                        
                        <button 
                          class="btn-icon active-icon" 
                          (click)="cambiarEstado(u)" 
                          [title]="u.estado === 'ACTIVO' ? 'Suspender' : 'Activar'"
                        >
                          <span class="material-symbols-outlined" [class.text-warning]="u.estado === 'ACTIVO'">
                            {{ u.estado === 'ACTIVO' ? 'block' : 'check_circle' }}
                          </span>
                        </button>

                        <button 
                          class="btn-icon delete active-icon" 
                          (click)="confirmarEliminar(u)" 
                          title="Eliminar"
                        >
                          <span class="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Footer / Pagination -->
        <footer class="table-footer">
          <div class="data-info">
            Mostrando <b>{{ startRange() }}-{{ endRange() }}</b> de <b>{{ totalItems() }}</b> usuarios
          </div>
          
          <div class="pagination">
            <button class="btn-nav" [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div class="page-numbers">
              @for (p of totalPagesArray(); track p) {
                <button 
                  class="page-btn" 
                  [class.active]="currentPage() === p"
                  (click)="currentPage.set(p)"
                >
                  {{ p }}
                </button>
              }
            </div>

            <button class="btn-nav" [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </footer>
      </section>

      <!-- Empty State -->
      @if (!loading() && usuariosFiltrados().length === 0) {
        <div class="empty-state animate-in">
          <span class="material-symbols-outlined large-icon">group_off</span>
          <h3>No se encontraron resultados</h3>
          <p>Ajusta los filtros para encontrar lo que buscas.</p>
        </div>
      }

      <!-- Redesigned Modal -->
      @if (formAbierto) {
        <div class="modal-overlay" (click)="formAbierto = false">
          <div class="modal-content animate-zoom" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Registrar Nuevo Miembro</h3>
              <button class="btn-close" (click)="formAbierto = false">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form class="modal-form" #f="ngForm" (ngSubmit)="guardarUsuario(f.value)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre</label>
                  <input 
                    type="text" 
                    ngModel 
                    name="nombre" 
                    required 
                    #nom="ngModel"
                    [class.invalid]="nom.invalid && nom.touched"
                    placeholder="Ej. Juan"
                  >
                </div>
                <div class="form-group">
                  <label>Apellido</label>
                  <input 
                    type="text" 
                    ngModel 
                    name="apellido" 
                    required 
                    #ape="ngModel"
                    [class.invalid]="ape.invalid && ape.touched"
                    placeholder="Ej. Pérez"
                  >
                </div>
                <div class="form-group full">
                  <label>Email Corporativo</label>
                  <input 
                    type="email" 
                    ngModel 
                    name="email" 
                    required 
                    email 
                    #mail="ngModel"
                    [class.invalid]="mail.invalid && mail.touched"
                    placeholder="usuario@ferreteria.com"
                  >
                  @if (mail.invalid && mail.touched) {
                    <span class="error-msg">Ingresa un correo electrónico válido</span>
                  }
                </div>
                <div class="form-group">
                  <label>Tipo Doc.</label>
                  <select ngModel="DNI" name="tipoDocumento" #tipoDoc="ngModel">
                    <option value="DNI">C.I. (Carnet)</option>
                    <option value="RUC">RUC (Empresa)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>N° Documento</label>
                  <input 
                    type="text" 
                    ngModel 
                    name="numeroDocumento" 
                    required 
                    minlength="7"
                    maxlength="12"
                    pattern="^[0-9]+$"
                    #numDoc="ngModel"
                    [class.invalid]="numDoc.invalid && numDoc.touched"
                    placeholder="Ej. 1234567"
                  >
                  @if (numDoc.touched && numDoc.errors?.['required']) {
                    <span class="error-msg">Este campo es obligatorio</span>
                  }
                  @if (numDoc.touched && numDoc.errors?.['pattern']) {
                    <span class="error-msg">Solo se permiten números</span>
                  }
                  @if (numDoc.touched && numDoc.errors?.['minlength']) {
                    <span class="error-msg">Mínimo 7 dígitos</span>
                  }
                </div>
                <div class="form-group">
                  <label>Rol en Sistema</label>
                  <select ngModel="VENDEDOR" name="rol">
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="ALMACENERO">Almacenero</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="text" 
                    ngModel 
                    name="telefono" 
                    pattern="^[0-9]+$"
                    #tel="ngModel"
                    [class.invalid]="tel.invalid && tel.touched"
                    placeholder="Ej. 70012345"
                  >
                  @if (tel.touched && tel.errors?.['pattern']) {
                    <span class="error-msg">Solo se permiten números</span>
                  }
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-ghost" (click)="formAbierto = false">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="f.invalid">
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="confirmModalOpen"
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario permanentemente?"
        type="danger"
        confirmText="Confirmar Eliminación"
        (confirm)="ejecutarEliminar()"
        (close)="confirmModalOpen = false"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .module-container {
      padding: var(--spacing-lg);
      background-color: var(--color-bg-primary);
      min-height: 100vh;
      animation: fadeIn 0.4s ease-out;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .page-header h1 {
      margin: 0;
      color: var(--color-text-primary);
      font: var(--font-display-lg);
    }

    .subtitle {
      margin: var(--spacing-xs) 0 0 0;
      color: var(--color-text-secondary);
      font: var(--font-body-md);
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--color-accent-primary), #fbbf24);
      color: #1a1a1a;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(245, 158, 11, 0.3); }
    .btn-primary:disabled { opacity: 0.5; transform: none; }

    .btn-secondary {
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      padding: 10px 16px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-ghost { color: var(--color-text-secondary); font-weight: 600; }

    /* Data Card */
    .data-card {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .toolbar {
      padding: var(--spacing-lg);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      background-color: rgba(255, 255, 255, 0.02);
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }
    .search-box input {
      width: 100%;
      padding-left: 44px;
      background-color: var(--color-bg-primary);
    }
    .search-box .icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-tertiary);
    }

    .filters {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    /* Dropdown */
    .dropdown-wrapper { position: relative; }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      width: 220px;
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      z-index: 100;
      padding: 8px;
    }
    .menu-title { padding: 8px; font-size: 11px; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--color-text-primary);
    }
    .menu-item:hover { background-color: var(--color-bg-tertiary); }
    .menu-clear { width: 100%; padding: 8px; font-size: 11px; color: var(--color-accent-primary); border-top: 1px solid var(--color-border); margin-top: 8px; }

    .arrow { transition: transform 0.2s; }
    .arrow.open { transform: rotate(180deg); }

    /* Toggle Switch */
    .toggle-control {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .toggle-control input { display: none; }
    .slider {
      width: 36px;
      height: 20px;
      background-color: var(--color-bg-tertiary);
      border-radius: 20px;
      position: relative;
      transition: 0.3s;
    }
    .slider::before {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      left: 3px;
      bottom: 3px;
      background-color: #64748b;
      border-radius: 50%;
      transition: 0.3s;
    }
    .toggle-control input:checked + .slider { background-color: rgba(245, 158, 11, 0.2); }
    .toggle-control input:checked + .slider::before { transform: translateX(16px); background-color: var(--color-accent-primary); }
    .label-text { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 500; }

    /* Table */
    .table-responsive { width: 100%; overflow-x: auto; }
    .senior-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .senior-table th {
      padding: 16px var(--spacing-lg);
      background-color: rgba(255, 255, 255, 0.02);
      color: var(--color-text-secondary);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .senior-table td {
      padding: 16px var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
      transition: opacity 0.3s;
    }
    .senior-table tbody tr:hover { background-color: rgba(255, 255, 255, 0.01); }

    .suspended-row td { opacity: 0.5; }
    .suspended-row .avatar { filter: grayscale(1); opacity: 0.7; }
    .suspended-row .name { text-decoration: line-through; color: var(--color-text-tertiary); }

    .self-tag {
      font-size: 10px;
      background: rgba(245, 158, 11, 0.2);
      color: var(--color-accent-primary);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
      font-weight: 800;
    }

    .active-icon { 
      color: var(--color-text-primary) !important; 
      opacity: 1 !important; 
      cursor: pointer !important;
    }
    .active-icon:hover {
      background-color: var(--color-bg-tertiary);
      transform: scale(1.1);
    }
    .text-warning { color: #f59e0b !important; }

    .user-cell { display: flex; align-items: center; gap: 14px; }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .info { display: flex; flex-direction: column; gap: 2px; }
    .name { font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem; }
    .email { font-size: 0.8rem; color: var(--color-text-secondary); }

    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .role-badge[data-role="ADMIN"] { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    .role-badge[data-role="GERENTE"] { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
    .role-badge[data-role="VENDEDOR"] { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .role-badge[data-role="ALMACENERO"] { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }

    .doc-info { display: flex; flex-direction: column; }
    .doc-info .type { font-size: 10px; font-weight: 700; color: var(--color-text-tertiary); }
    .doc-info .number { font-size: 0.85rem; color: var(--color-text-primary); font-family: var(--font-family-mono); }

    .date-text { font-size: 0.8rem; color: var(--color-text-secondary); }

    .status-indicator { display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background-color: #64748b; }
    .dot.active { background-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
    .status-indicator .text { font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: capitalize; }

    .actions { display: flex; justify-content: flex-end; gap: 6px; }
    .btn-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      transition: 0.2s;
    }
    .btn-icon:disabled { cursor: not-allowed; opacity: 0.4; }
    .opacity-30 { opacity: 0.3; }
    .text-danger { color: #ef4444 !important; }

    /* Footer */
    .table-footer {
      padding: var(--spacing-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.01);
    }
    .data-info { font-size: 0.85rem; color: var(--color-text-secondary); }
    .data-info b { color: var(--color-text-primary); }

    .pagination { display: flex; align-items: center; gap: 12px; }
    .page-numbers { display: flex; gap: 4px; }
    .page-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .page-btn.active { background-color: var(--color-accent-primary); color: #1a1a1a; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
    .page-btn:hover:not(.active) { background-color: var(--color-bg-tertiary); color: var(--color-text-primary); }
    .btn-nav { color: var(--color-text-tertiary); }
    .btn-nav:disabled { opacity: 0.3; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }
    .modal-content {
      background-color: var(--color-bg-secondary);
      width: 100%;
      max-width: 600px;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .modal-header {
      padding: 24px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--color-bg-tertiary);
    }
    .modal-header h3 { margin: 0; font: var(--font-display-sm); }
    .modal-form { padding: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group.full { grid-column: span 2; }
    .form-group label { font-size: 11px; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; }
    
    .error-msg { font-size: 10px; color: #ef4444; margin-top: 4px; font-weight: 600; }
    input.invalid, select.invalid { border-color: rgba(239, 68, 68, 0.5) !important; background-color: rgba(239, 68, 68, 0.05) !important; }

    .form-actions { margin-top: 32px; display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid var(--color-border); padding-top: 24px; }

    /* Animations */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeIn 0.3s ease-out; }
    .animate-zoom { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    .skeleton-line { height: 20px; background-color: var(--color-bg-tertiary); border-radius: 4px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .empty-state { text-align: center; padding: 60px; color: var(--color-text-secondary); }
    .large-icon { font-size: 64px; color: var(--color-bg-tertiary); margin-bottom: 16px; }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full { grid-column: span 1; }
    }
  `]
})
export class ListaUsuariosComponent implements OnInit {
  public usuariosService = inject(UsuariosService);
  public authService = inject(AuthService);
  public toast = inject(ToastService);

  usuarios = signal<Usuario[]>([]);
  loading = signal<boolean>(false);
  
  // Usuario actual logueado como señal reactiva
  currentUser = signal<any>(null);
  
  // State 
  searchTerm = signal('');
  selectedRoles = signal<string[]>([]);
  soloActivos = signal(localStorage.getItem('user_filter_only_active') === 'true');
  isRoleDropdownOpen = signal(false);
  
  rolesDisponibles = ['ADMIN', 'GERENTE', 'VENDEDOR', 'ALMACENERO', 'AUDITOR'];

  // Paginación
  currentPage = signal(1);
  pageSize = signal(8);

  // Modal Crear
  formAbierto = false;

  // Modal Confirmar
  confirmModalOpen = false;
  usuarioAEliminar: string | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isRoleDropdownOpen()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-wrapper')) {
        this.isRoleDropdownOpen.set(false);
      }
    }
  }

  usuariosFiltrados = computed(() => {
    let result = this.usuarios();
    
    // Filtro por Rol (Múltiple)
    if (this.selectedRoles().length > 0) {
      result = result.filter(u => this.selectedRoles().includes(u.rol));
    }
    
    // Filtro Solo Activos
    if (this.soloActivos()) {
      result = result.filter(u => u.estado === 'ACTIVO');
    }

    // Filtro Búsqueda
    if (this.searchTerm().trim() !== '') {
      const q = this.searchTerm().toLowerCase();
      result = result.filter(u => 
        (u.nombre + ' ' + u.apellido).toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.numeroDocumento.includes(q)
      );
    }
    
    return result;
  });

  paginatedUsuarios = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.usuariosFiltrados().slice(start, end);
  });

  totalItems = computed(() => this.usuariosFiltrados().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);
  
  totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  startRange = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endRange = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  ngOnInit() {
    this.cargarUsuarios();
    // Suscribirse al estado de auth para tener el usuario siempre actualizado
    this.authService.auth$.subscribe(state => {
      this.currentUser.set(state.user);
    });
  }

  // Guardar preferencia de filtro al cambiar
  onSoloActivosChange(val: boolean) {
    this.soloActivos.set(val);
    localStorage.setItem('user_filter_only_active', val.toString());
    this.currentPage.set(1);
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.usuariosService.findAll().subscribe({
      next: (data) => {
        // Añadir datos de ejemplo realistas si no hay fechas
        const demoData = data.map(u => ({
          ...u,
          fechaUltimoAcceso: u.fechaUltimoAcceso || this.getRandomDemoDate()
        }));
        this.usuarios.set(demoData);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getRandomDemoDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 5);
    const hoursAgo = Math.floor(Math.random() * 24);
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() - hoursAgo);
    return now.toISOString();
  }

  toggleRoleDropdown(event: Event) {
    event.stopPropagation();
    this.isRoleDropdownOpen.update(v => !v);
  }

  toggleRolSelection(rol: string) {
    const current = this.selectedRoles();
    if (current.includes(rol)) {
      this.selectedRoles.set(current.filter(r => r !== rol));
    } else {
      this.selectedRoles.set([...current, rol]);
    }
    this.currentPage.set(1);
  }

  abrirFormulario() {
    this.formAbierto = true;
  }

  guardarUsuario(val: any) {
    this.loading.set(true);
    const payload: CreateUsuarioPayload = {
      ...val,
      estado: 'ACTIVO' as UserStatus
    };

    console.log('Enviando registro de usuario:', payload);

    this.usuariosService.create(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Miembro registrado exitosamente.');
        this.formAbierto = false;
        this.cargarUsuarios();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error detallado al crear usuario:', err);
        
        let msg = 'Error al registrar. Revisa los datos.';
        
        if (err.status === 409) {
          msg = 'Conflicto: El Email o N° de Documento ya está registrado.';
        } else if (err.error?.message) {
          msg = Array.isArray(err.error.message) ? err.error.message[0] : err.error.message;
        }

        this.toast.showError(msg);
      }
    });
  }

  getModifyTitle(u: Usuario): string {
    if (!this.canModifyStatus(u)) return 'Debe haber al menos un Administrador activo';
    return u.estado === 'ACTIVO' ? 'Suspender' : 'Activar';
  }

  getDeleteTitle(u: Usuario): string {
    if (!this.canDeleteUser(u)) return 'Debe haber al menos un Administrador activo';
    return 'Eliminar';
  }

  canModifyStatus(u: Usuario): boolean {
    const curr = this.currentUser();
    if (!curr) return false;

    // Si es ADMIN y está activo, verificar que no sea el último antes de dejarlo suspenderse
    if (u.rol === 'ADMIN' && u.estado === 'ACTIVO') {
      const activeAdmins = this.usuarios().filter(usr => usr.rol === 'ADMIN' && usr.estado === 'ACTIVO');
      if (activeAdmins.length <= 1) return false;
    }

    return true;
  }

  canDeleteUser(u: Usuario): boolean {
    const curr = this.currentUser();
    if (!curr) return false;

    // No puedes eliminar al último ADMIN activo
    if (u.rol === 'ADMIN') {
      const activeAdmins = this.usuarios().filter(usr => usr.rol === 'ADMIN' && usr.estado === 'ACTIVO');
      if (activeAdmins.length <= 1 && u.estado === 'ACTIVO') return false;
    }

    return true;
  }

  cambiarEstado(u: Usuario) {
    console.log('Cambiando estado de:', u.email);
    
    // Verificación de seguridad
    if (u.rol === 'ADMIN' && u.estado === 'ACTIVO') {
      const activeAdmins = this.usuarios().filter(usr => usr.rol === 'ADMIN' && usr.estado === 'ACTIVO');
      if (activeAdmins.length <= 1) {
        this.toast.showError('ERROR CRÍTICO: Debe haber al menos un Administrador activo.');
        return;
      }
    }

    if (u.id === this.currentUser()?.id && u.estado === 'ACTIVO') {
      if (!confirm('ADVERTENCIA: Vas a suspender tu PROPIA cuenta. Serás desconectado inmediatamente. ¿Continuar?')) {
        return;
      }
    }
    
    const newStatus = u.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    this.usuariosService.updateEstado(u.id, newStatus).subscribe({
      next: () => {
        this.toast.showSuccess(`Estado actualizado: ${u.nombre} es ahora ${newStatus}`);
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.toast.showError('Error al actualizar el estado en el servidor.');
      }
    });
  }

  resetearClave(u: Usuario) {
    console.log('Reseteando clave para:', u.email);
    this.usuariosService.resetPassword(u.id).subscribe({
      next: (res) => {
        console.log('Nueva clave recibida:', res.temporal);
        this.toast.showSuccess(`Clave reseteada. Nueva clave: ${res.temporal}`);
      },
      error: (err) => {
        console.error('Error al resetear clave:', err);
        this.toast.showError('Error al conectar con el servidor para resetear clave.');
      }
    });
  }

  confirmarEliminar(u: Usuario) {
    console.log('Intentando eliminar a:', u.email);
    
    if (u.id === this.currentUser()?.id) {
      this.toast.showError('No puedes eliminar tu propia cuenta mientras estás logueado.');
      return;
    }

    if (u.rol === 'ADMIN' && u.estado === 'ACTIVO') {
      const activeAdmins = this.usuarios().filter(usr => usr.rol === 'ADMIN' && usr.estado === 'ACTIVO');
      if (activeAdmins.length <= 1) {
        this.toast.showError('No se puede eliminar al único Administrador activo.');
        return;
      }
    }

    this.usuarioAEliminar = u.id;
    this.confirmModalOpen = true;
  }

  ejecutarEliminar() {
    if (this.usuarioAEliminar) {
      this.usuariosService.remove(this.usuarioAEliminar).subscribe({
        next: () => {
          this.toast.showSuccess('Usuario eliminado permanentemente.');
          this.confirmModalOpen = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.toast.showError('Error al eliminar el usuario.');
        }
      });
    }
  }
}

