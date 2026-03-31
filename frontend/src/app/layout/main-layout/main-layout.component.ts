import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <app-sidebar></app-sidebar>
    <app-topbar></app-topbar>
    
    <main class="main-content">
      <div class="content-container">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    .main-content {
      margin-left: 240px;
      margin-top: 72px;
      padding: var(--spacing-xl);
      background-color: var(--color-bg-primary);
      min-height: calc(100vh - 72px);
      transition: margin-left var(--transition-base);
    }

    .content-container {
      max-width: 1920px;
      margin: 0 auto;
      animation: fadeInUp 0.3ms ease-out;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 64px;
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 480px) {
      .main-content {
        margin-left: 0;
        margin-bottom: 64px;
        padding: var(--spacing-md);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme from localStorage or system preference
    this.themeService.getCurrentTheme();
  }
}
  