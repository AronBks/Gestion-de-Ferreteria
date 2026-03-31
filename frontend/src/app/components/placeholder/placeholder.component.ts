import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div style="font-size: 64px; margin-bottom: 24px;">🚧</div>
        <h2>Sección en construcción</h2>
        <p>Esta sección está siendo desarrollada</p>
        <p class="text-secondary">Vuelve pronto para nuevas funcionalidades</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      animation: fadeInUp 0.3s ease-out;
    }

    .placeholder-content {
      text-align: center;
    }

    .placeholder-icon {
      color: var(--color-accent-primary);
      margin-bottom: var(--spacing-lg);
      opacity: 0.5;
    }

    h2 {
      font: var(--font-display-md);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    p {
      font: 400 1rem / 1.5 var(--font-family-body);
      color: var(--color-text-secondary);
      margin: var(--spacing-sm) 0;
    }

    .text-secondary {
      color: var(--color-text-tertiary);
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
export class PlaceholderComponent {
}
