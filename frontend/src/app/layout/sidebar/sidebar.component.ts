import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../services/auth.service';
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
    :host {
      --sidebar-width-expanded: 260px;
      --sidebar-width-collapsed: 80px;
      --transition-duration: 0.35s;
      --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ========== SIDEBAR MAIN ========== */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: var(--sidebar-width-expanded);
      background-color: var(--color-sidebar-bg);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-duration) var(--transition-timing);
      z-index: 1000;
      overflow: hidden;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
    }

    /* Collapsed State */
    .sidebar.collapsed {
      width: var(--sidebar-width-collapsed);
    }

    /* ========== HEADER SECTION ========== */
    .sidebar-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      position: relative;
      min-height: 80px;
      flex-shrink: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
      min-width: 0;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .logo-container {
      justify-content: center;
      flex: unset;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      color: var(--color-accent-primary);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      flex: 1;
      overflow: hidden;
      min-width: 0;
    }

    .logo-text h1 {
      font: var(--font-display-sm);
      color: var(--color-text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logo-text p {
      font: var(--font-body-xs);
      color: var(--color-text-secondary);
      margin: 0;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapse-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-primary);
      background: var(--color-bg-tertiary);
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);
      border: 1px solid var(--color-border);
      padding: 0;
      font-size: 18px;
      flex-shrink: 0;
    }

    .collapse-btn:hover {
      background-color: var(--color-accent-primary);
      color: white;
      border-color: var(--color-accent-primary);
      transform: scale(1.05);
    }

    .collapse-btn:active {
      transform: scale(0.95);
    }

    /* ========== NAVIGATION SECTION ========== */
    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--spacing-md) 0;
    }

    .nav-section {
      padding: 0 var(--spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .nav-label {
      font: var(--font-body-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: var(--spacing-sm) var(--spacing-md);
      margin: var(--spacing-md) 0 var(--spacing-sm) 0;
      opacity: 0.6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .nav-label {
      width: 0;
      overflow: hidden;
      padding: 0;
      margin: 0;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      position: relative;
      transition: all var(--transition-duration) var(--transition-timing);
      border-left: 3px solid transparent;
      cursor: pointer;
      user-select: none;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: var(--spacing-md);
      gap: 0;
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

    .sidebar.collapsed .nav-item.active {
      border-left-color: transparent;
      background-color: rgba(245, 158, 11, 0.2);
    }

    .nav-item span:first-child {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-label-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .nav-label-text {
      display: none;
    }

    .badge {
      background-color: var(--color-danger);
      color: white;
      border-radius: var(--radius-full);
      padding: 3px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
      transition: opacity var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .badge {
      display: none;
    }

    /* ========== FOOTER SECTION ========== */
    .sidebar-footer {
      padding: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      flex-shrink: 0;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .sidebar-footer {
      align-items: center;
    }

    /* Theme Toggle Button */
    .theme-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-accent-primary);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all var(--transition-duration) var(--transition-timing);
      border: none;
      cursor: pointer;
      user-select: none;
    }

    .sidebar.collapsed .theme-toggle {
      width: 44px;
      height: 44px;
      padding: 0;
      justify-content: center;
    }

    .theme-toggle:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .theme-toggle:active {
      transform: translateY(0px);
    }

    .theme-toggle span:first-child {
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .theme-toggle span:last-child {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar.collapsed .theme-toggle span:last-child {
      display: none;
    }

    /* User Section */
    .user-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .sidebar.collapsed .user-section {
      display: none;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      line-height: 1.2;
      color: var(--color-text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font: var(--font-body-xs);
      color: var(--color-text-secondary);
      margin: 4px 0 0 0;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Logout Button */
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background-color: #EF4444;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all var(--transition-duration) var(--transition-timing);
      border: none;
      cursor: pointer;
      user-select: none;
    }

    .sidebar.collapsed .logout-btn {
      width: 44px;
      height: 44px;
      padding: 0;
      justify-content: center;
    }

    .logout-btn:hover {
      background-color: #DC2626;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .logout-btn:active {
      transform: translateY(0px);
    }

    .logout-btn span:first-child {
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logout-btn span:last-child {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar.collapsed .logout-btn span:last-child {
      display: none;
    }

    /* ========== UTILITY CLASSES ========== */
    .text-xs {
      font: var(--font-body-xs);
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 768px) {
      :host {
        --sidebar-width-expanded: 240px;
        --sidebar-width-collapsed: 70px;
      }

      .sidebar {
        width: var(--sidebar-width-collapsed);
      }

      .sidebar.collapsed {
        width: var(--sidebar-width-collapsed);
      }

      .logo-text,
      .nav-label,
      .nav-label-text,
      .badge,
      .user-section,
      .theme-toggle span:last-child,
      .logout-btn span:last-child {
        display: none;
      }

      .sidebar-header {
        padding: var(--spacing-md);
        min-height: 70px;
      }

      .nav-item,
      .collapse-btn {
        justify-content: center;
      }
    }

    /* ========== MOTION PREFERENCES ========== */
    @media (prefers-reduced-motion: reduce) {
      .sidebar,
      .logo-container,
      .nav-label,
      .nav-item,
      .nav-label-text,
      .badge,
      .sidebar-footer,
      .theme-toggle,
      .logout-btn,
      .collapse-btn {
        transition: none !important;
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

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkMode = theme === 'dark';
      });

    this.sidebarService.collapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.isCollapsed = collapsed;
      });
  }

  toggleCollapse(): void {
    this.sidebarService.toggleCollapsed();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
  