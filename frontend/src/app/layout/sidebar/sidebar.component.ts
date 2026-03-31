import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo-container" [class.collapsed]="isCollapsed">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M7 12h10M12 7v10M3 9h18M3 15h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div class="logo-text" *ngIf="!isCollapsed">
            <h1>Ferretería BL</h1>
            <p class="text-xs">ao Bolivia</p>
          </div>
        </div>
        <button 
          class="collapse-btn"
          (click)="toggleCollapse()"
          [attr.aria-label]="isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
          [title]="isCollapsed ? 'Expandir' : 'Colapsar'">
          <span style="font-size: 20px; line-height: 1;">{{ isCollapsed ? '›' : '‹' }}</span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-label" *ngIf="!isCollapsed">Principal</div>
          <div class="nav-items">
            <a 
              *ngFor="let item of navItems"
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-item"
              [attr.aria-label]="item.label"
              [title]="isCollapsed ? item.label : ''">
              <span style="font-size: 20px; line-height: 1;">{{ item.icon }}</span>
              <span class="nav-label-text" *ngIf="!isCollapsed">{{ item.label }}</span>
              <span class="badge" *ngIf="item.badge && !isCollapsed">{{ item.badge }}</span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <!-- Theme Toggle -->
        <button 
          class="theme-toggle"
          (click)="toggleTheme()"
          [attr.aria-label]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          <span style="font-size: 20px; line-height: 1;">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span *ngIf="!isCollapsed" class="text-xs">
            {{ isDarkMode ? 'Claro' : 'Oscuro' }}
          </span>
        </button>

        <!-- User Section -->
        <div class="user-section" *ngIf="!isCollapsed">
          <div class="user-avatar">A</div>
          <div class="user-info">
            <p class="user-name">Administrador</p>
            <p class="user-email">admin@ferreteria.bo</p>
          </div>
        </div>

        <!-- Logout Button -->
        <button 
          class="logout-btn"
          (click)="logout()"
          [attr.aria-label]="'Cerrar sesión'">
          <span style="font-size: 20px; line-height: 1;">🚪</span>
          <span *ngIf="!isCollapsed">Salir</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 240px;
      background-color: var(--color-sidebar-bg);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-base), background-color var(--transition-base);
      z-index: 1000;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar.collapsed {
      width: 64px;
    }

    /* Header Section */
    .sidebar-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
      transition: all var(--transition-base);
    }

    .logo-container.collapsed {
      justify-content: center;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: var(--color-accent-primary);
      flex-shrink: 0;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      flex: 1;
    }

    .logo-text h1 {
      font: var(--font-display-sm);
      color: var(--color-text-primary);
      margin: 0;
    }

    .logo-text p {
      font: var(--font-body-xs);
      color: var(--color-text-primary);
      margin: 0;
      opacity: 0.7;
    }

    .collapse-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-primary);
      background: transparent;
      cursor: pointer;
      transition: all var(--transition-base);
      border: none;
      padding: 0;
      font-size: 20px;
    }

    .collapse-btn:hover {
      background-color: var(--color-bg-tertiary);
      color: var(--color-accent-primary);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-lg) 0;
      overflow-y: auto;
    }

    .nav-section {
      padding: 0 var(--spacing-md) var(--spacing-lg);
    }

    .nav-label {
      font: var(--font-body-xs);
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: var(--spacing-sm) var(--spacing-md);
      margin-bottom: var(--spacing-md);
      opacity: 0.7;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-md);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      position: relative;
      transition: all var(--transition-base);
      border-left: 3px solid transparent;
      cursor: pointer;
      white-space: nowrap;
    }

    .nav-item:hover {
      background-color: var(--color-bg-tertiary);
      color: var(--color-accent-primary);
    }

    .nav-item.active {
      background-color: rgba(245, 158, 11, 0.12);
      border-left-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
    }

    .nav-item span:first-child {
      font-size: 20px;
      display: flex;
      align-items: center;
    }

    .nav-label-text {
      flex: 1;
      color: var(--color-text-primary);
    }

    .badge {
      background-color: var(--color-danger);
      color: white;
      border-radius: var(--radius-full);
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Footer Section */
    .sidebar-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .theme-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      justify-content: center;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-accent-primary);
      color: var(--color-text-primary);
      font-weight: 600;
      transition: all var(--transition-base);
      border: none;
      cursor: pointer;
    }

    .theme-toggle:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    .theme-toggle span:first-child {
      font-size: 20px;
      display: flex;
      align-items: center;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      transition: all var(--transition-base);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font: 600 0.95rem / 1.2 var(--font-family-body);
      color: var(--color-text-primary);
      margin: 0;
    }

    .user-email {
      font: var(--font-body-xs);
      color: var(--color-text-tertiary);
      margin: 0;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      justify-content: center;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-danger);
      color: white;
      font-weight: 600;
      transition: all var(--transition-base);
      border: none;
      cursor: pointer;
    }

    .logout-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .logout-btn span:first-child {
      font-size: 20px;
      display: flex;
      align-items: center;
    }

    /* Collapsed State Footer */
    .sidebar.collapsed .sidebar-footer {
      align-items: center;
      padding: var(--spacing-md);
    }

    .sidebar.collapsed .theme-toggle,
    .sidebar.collapsed .logout-btn {
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar.collapsed .theme-toggle span:last-child,
    .sidebar.collapsed .logout-btn span:last-child {
      display: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 64px;
      }

      .sidebar.collapsed {
        width: 64px;
      }

      .logo-text,
      .nav-label-text,
      .badge,
      .user-section,
      .logout-btn span:last-child,
      .theme-toggle span:last-child {
        display: none;
      }

      .sidebar-header {
        padding: var(--spacing-md);
      }

      .nav-item {
        justify-content: center;
        padding: var(--spacing-md);
      }
    }

    /* Utility Classes */
    .text-xs {
      font: var(--font-body-xs);
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
      }
    }

    .logout-btn:hover {
      background-color: #DC2626;
      opacity: 0.9;
    }

    /* Collapsed State Footer */
    .sidebar.collapsed .sidebar-footer {
      align-items: center;
      padding: var(--spacing-md);
    }

    .sidebar.collapsed .theme-toggle,
    .sidebar.collapsed .logout-btn {
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar.collapsed .theme-toggle span,
    .sidebar.collapsed .logout-btn span {
      display: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 64px;
      }

      .sidebar.collapsed {
        width: 64px;
      }

      .logo-text,
      .nav-label-text,
      .badge,
      .user-section,
      .logout-btn span {
        display: none;
      }

      .sidebar-header {
        padding: var(--spacing-md);
      }

      .nav-item {
        justify-content: center;
        padding: var(--spacing-md);
      }
    }

    /* Utility Classes */
    .text-xs {
      font: 400 0.75rem / 1.5 var(--font-family-body);
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isDarkMode = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Productos', path: '/dashboard/productos', icon: '📦' },
    { label: 'Ventas', path: '/dashboard/ventas', icon: '💳' },
    { label: 'Usuarios', path: '/dashboard/usuarios', icon: '👥' },
    { label: 'Reportes', path: '/dashboard/reportes', icon: '📈' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkMode = theme === 'dark';
      });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    // TODO: Call logout from AuthService
    console.log('Logout clicked');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
  