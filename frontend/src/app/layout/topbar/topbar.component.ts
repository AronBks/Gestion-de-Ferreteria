import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
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
    .topbar {
      position: fixed;
      top: 0;
      left: 240px;
      right: 0;
      height: 72px;
      background-color: var(--color-topbar-bg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      transition: left var(--transition-base), background-color var(--transition-base);
      z-index: 999;
    }

    .topbar-content {
      width: 100%;
      height: 100%;
      padding: 0 var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-xl);
    }

    /* Breadcrumb Section */
    .breadcrumb-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .breadcrumb-item {
      font: var(--font-body-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: color var(--transition-base);
    }

    .breadcrumb-item:hover {
      color: var(--color-text-primary);
    }

    .breadcrumb-item.active {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .breadcrumb-separator {
      color: var(--color-border);
    }

    .greeting {
      font: var(--font-body-md);
      color: var(--color-text-primary);
      margin: 0;
    }

    /* Actions */
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
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
      transition: all var(--transition-base);
      font-size: 20px;
    }

    .action-btn:hover,
    .user-avatar:hover {
      background-color: var(--color-border);
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
    }

    .user-avatar {
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
      color: white;
      font-weight: 600;
      font-size: 18px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .topbar {
        left: 64px;
        height: 64px;
      }

      .topbar-content {
        padding: 0 var(--spacing-lg);
      }

      .breadcrumb-section {
        flex: 1;
      }

      .breadcrumb {
        display: none;
      }

      .greeting {
        font-size: 0.85rem;
      }
    }
  `]
})
export class TopbarComponent implements OnInit {
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
  