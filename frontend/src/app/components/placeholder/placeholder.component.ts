import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-card">
        <h2>🚀 Sección en Desarrollo</h2>
        <p>Este módulo estará disponible pronto.</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      padding: 2rem;
      text-align: center;
    }
    
    .placeholder-card {
      background: white;
      padding: 3rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }
  `]
})
export class PlaceholderComponent { }
