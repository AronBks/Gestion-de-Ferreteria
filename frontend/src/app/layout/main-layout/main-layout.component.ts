import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout-container" [class.sidebar-collapsed]="isSidebarCollapsed">
      <app-sidebar></app-sidebar>
      <div class="layout-wrapper">
        <app-topbar [isSidebarCollapsed]="isSidebarCollapsed"></app-topbar>
        <main class="main-content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      --sidebar-width-expanded: 260px;
      --sidebar-width-collapsed: 80px;
      --topbar-height: 72px;
      --transition-duration: 0.35s;
      --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ========== LAYOUT CONTAINER (GRID) ========== */
    .layout-container {
      display: grid;
      grid-template-columns: var(--sidebar-width-expanded) 1fr;
      grid-template-rows: 1fr;
      height: 100vh;
      transition: grid-template-columns var(--transition-duration) var(--transition-timing);
      background-color: var(--color-bg-primary);
    }

    .layout-container.sidebar-collapsed {
      grid-template-columns: var(--sidebar-width-collapsed) 1fr;
    }

    /* ========== LAYOUT WRAPPER (for sidebar + content) ========== */
    .layout-wrapper {
      display: grid;
      grid-template-rows: var(--topbar-height) 1fr;
      height: 100vh;
      overflow: hidden;
    }

    /* ========== TOPBAR ========== */
    app-topbar {
      grid-row: 1;
      grid-column: 1;
      z-index: 999;
    }

    /* ========== MAIN CONTENT ========== */
    .main-content {
      grid-row: 2;
      grid-column: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: var(--color-bg-primary);
    }

    .content-container {
      flex: 1;
      padding: var(--spacing-xl);
      max-width: 1920px;
      width: 100%;
      margin: 0 auto;
      animation: slideInContent 0.4s ease-out;
    }

    /* ========== RESPONSIVE DESIGN ========== */
    @media (max-width: 1024px) {
      :host {
        --sidebar-width-expanded: 280px;
        --sidebar-width-collapsed: 76px;
      }

      .content-container {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 768px) {
      :host {
        --sidebar-width-expanded: 240px;
        --sidebar-width-collapsed: 70px;
      }

      .layout-container {
        grid-template-columns: var(--sidebar-width-collapsed) 1fr;
      }

      .content-container {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 480px) {
      :host {
        --sidebar-width-expanded: 240px;
        --sidebar-width-collapsed: 64px;
        --topbar-height: 60px;
      }

      .content-container {
        padding: var(--spacing-md);
      }
    }

    /* ========== ANIMATIONS ========== */
    @keyframes slideInContent {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ========== ACCESSIBILITY ========== */
    @media (prefers-reduced-motion: reduce) {
      .layout-container,
      .main-content,
      .content-container {
        transition: none !important;
        animation: none !important;
      }
    }

    /* ========== SCROLLBAR STYLING ========== */
    .main-content::-webkit-scrollbar {
      width: 8px;
    }

    .main-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .main-content::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }

    .main-content::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-secondary);
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Initialize theme from localStorage or system preference
    this.themeService.getCurrentTheme();

    this.sidebarService.collapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.isSidebarCollapsed = collapsed;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
  