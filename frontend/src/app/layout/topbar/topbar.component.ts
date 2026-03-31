import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar" [ngClass]="{ collapsed: isSidebarCollapsed }">
      <div class="topbar-content">
        <!-- Breadcrumb & Greeting -->
        <div class="breadcrumb-section">
          <nav class="breadcrumb">
            <a href="#" class="breadcrumb-item">Dashboard</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">{{ currentSection }}</span>
          </nav>
          <p class="greeting">Bienvenido, Administrador — {{ currentDate }}</p>
        </div>

        <!-- Right Section -->
        <div class="topbar-actions">
          <!-- Notifications -->
          <button class="action-btn" aria-label="Notificaciones">
            <span style="font-size: 20px; line-height: 1;">🔔</span>
            <span class="notification-badge">3</span>
          </button>

          <!-- User Avatar -->
          <button class="user-avatar" aria-label="Perfil de usuario">
            <span style="font-size: 18px; line-height: 1;">👤</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      --sidebar-width-expanded: 260px;
      --sidebar-width-collapsed: 80px;
      --topbar-height: 72px;
      --transition-duration: 0.35s;
      --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ========== TOPBAR MAIN ========== */
    .topbar {
      position: fixed;
      top: 0;
      left: var(--sidebar-width-expanded);
      width: calc(100% - var(--sidebar-width-expanded));
      height: var(--topbar-height);
      background-color: var(--color-topbar-bg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      transition: 
        left var(--transition-duration) var(--transition-timing),
        width var(--transition-duration) var(--transition-timing),
        background-color var(--transition-duration) var(--transition-timing);
      z-index: 999;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Collapsed State - Sidebar Minimizado */
    .topbar.collapsed {
      left: var(--sidebar-width-collapsed);
      width: calc(100% - var(--sidebar-width-collapsed));
    }

    /* ========== TOPBAR CONTENT ========== */
    .topbar-content {
      width: 100%;
      height: 100%;
      padding: 0 var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-xl);
    }

    /* ========== BREADCRUMB SECTION ========== */
    .breadcrumb-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
      flex: 1;
      min-width: 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      overflow: hidden;
    }

    .breadcrumb-item {
      font: var(--font-body-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: color var(--transition-duration) var(--transition-timing);
      white-space: nowrap;
    }

    .breadcrumb-item:hover {
      color: var(--color-text-primary);
    }

    .breadcrumb-item.active {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .breadcrumb-separator {
      color: var(--color-border);
      flex-shrink: 0;
    }

    .greeting {
      font: var(--font-body-md);
      color: var(--color-text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    /* ========== ACTIONS SECTION ========== */
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex-shrink: 0;
    }

    .action-btn,
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all var(--transition-duration) var(--transition-timing);
      font-size: 20px;
      user-select: none;
      flex-shrink: 0;
    }

    .action-btn:hover,
    .user-avatar:hover {
      background-color: var(--color-border);
      transform: translateY(-2px);
    }

    .action-btn:active,
    .user-avatar:active {
      transform: translateY(0px);
    }

    .action-btn:focus-visible,
    .user-avatar:focus-visible {
      outline: 2px solid var(--color-accent-primary);
      outline-offset: 2px;
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background-color: var(--color-danger);
      color: white;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font: 600 0.7rem / 1 var(--font-family-body);
      border: 2px solid var(--color-topbar-bg);
      animation: pulse 2s infinite;
    }

    .user-avatar {
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      font-weight: 600;
      font-size: 18px;
    }

    /* ========== ANIMATIONS ========== */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    /* ========== RESPONSIVE DESIGN ========== */
    @media (max-width: 1024px) {
      :host {
        --sidebar-width-expanded: 280px;
        --sidebar-width-collapsed: 76px;
        --topbar-height: 70px;
      }

      .topbar-content {
        padding: 0 var(--spacing-lg);
      }
    }

    @media (max-width: 768px) {
      :host {
        --sidebar-width-expanded: 240px;
        --sidebar-width-collapsed: 70px;
        --topbar-height: 64px;
      }

      .topbar {
        left: var(--sidebar-width-collapsed);
      }

      .topbar.collapsed {
        left: var(--sidebar-width-collapsed);
      }

      .topbar-content {
        padding: 0 var(--spacing-lg);
        gap: var(--spacing-md);
      }

      .breadcrumb-section {
        gap: var(--spacing-xs);
      }

      .breadcrumb {
        display: none;
      }

      .greeting {
        font: var(--font-body-sm);
        font-size: 0.85rem;
      }

      .topbar-actions {
        gap: var(--spacing-md);
      }

      .action-btn,
      .user-avatar {
        width: 36px;
        height: 36px;
        font-size: 18px;
      }

      .notification-badge {
        width: 18px;
        height: 18px;
        font-size: 0.65rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        --sidebar-width-expanded: 240px;
        --sidebar-width-collapsed: 64px;
        --topbar-height: 56px;
      }

      .topbar {
        left: var(--sidebar-width-collapsed);
      }

      .topbar-content {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-sm);
      }

      .breadcrumb-section {
        min-width: 0;
      }

      .greeting {
        font-size: 0.8rem;
      }

      .topbar-actions {
        gap: var(--spacing-sm);
      }

      .action-btn,
      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .notification-badge {
        width: 16px;
        height: 16px;
        font-size: 0.6rem;
        top: -6px;
        right: -6px;
      }
    }

    /* ========== ACCESSIBILITY ========== */
    @media (prefers-reduced-motion: reduce) {
      .topbar,
      .action-btn,
      .user-avatar,
      .breadcrumb-item,
      .notification-badge {
        transition: none !important;
        animation: none !important;
      }
    }

    /* ========== HIGH CONTRAST MODE ========== */
    @media (prefers-contrast: more) {
      .topbar {
        border-bottom-width: 2px;
        box-shadow: none;
      }

      .action-btn,
      .user-avatar {
        border: 1px solid var(--color-border);
      }
    }
  `]
})
export class TopbarComponent implements OnInit {
  @Input() isSidebarCollapsed = false;

  currentSection = 'Dashboard';
  currentDate = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateDate();
    this.setupRouterListener();
    
    // Update date every minute
    setInterval(() => this.updateDate(), 60000);
  }

  private updateDate(): void {
    const today = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    
    this.currentDate = `${dayName}, ${day} de ${month} ${year}`;
  }

  private setupRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.url;
        
        if (url.includes('productos')) {
          this.currentSection = 'Productos';
        } else if (url.includes('ventas')) {
          this.currentSection = 'Ventas';
        } else if (url.includes('usuarios')) {
          this.currentSection = 'Usuarios';
        } else if (url.includes('reportes')) {
          this.currentSection = 'Reportes';
        } else {
          this.currentSection = 'Dashboard';
        }
      });
  }
}
  