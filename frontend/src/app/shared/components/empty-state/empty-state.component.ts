import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center text-text-secondary dark:text-gray-400">
      <div class="w-48 h-48 mb-6 text-gray-300 dark:text-gray-600">
        <!-- Puedes reemplazar SVG con ícono dinámico -->
        <i class="lucide w-full h-full" [class]="icon" style="font-size: 64px;"></i>
      </div>
      <h3 class="text-xl font-medium text-text-primary dark:text-white mb-2">{{ title }}</h3>
      <p class="mb-6 max-w-sm">{{ description }}</p>
      
      @if (actionLabel) {
        <button 
          (click)="action.emit()" 
          class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'receipt'; // clase de lucide por defecto
  @Input() title = 'No hay datos';
  @Input() description = 'No se encontró información para mostrar en este momento.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}