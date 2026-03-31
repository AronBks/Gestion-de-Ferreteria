import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="px-2.5 py-1 rounded-full text-xs font-medium border flex items-center justify-center gap-1.5 w-fit"
          [ngClass]="getClasses()">
      @if (animated && isPending()) {
        <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      } @else if (animated && isActive()) {
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      }
      <ng-content></ng-content>
      {{ status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() animated: boolean = false;
  /**
   * type:
   * 'success' -> verde (COMPLETADA, ACTIVO)
   * 'warning' -> ámbar (PENDIENTE, ALMACENERO)
   * 'danger'  -> rojo (CANCELADA, SUSPENDIDO)
   * 'info'    -> azul (GERENTE)
   * 'neutral' -> gris (DEVUELTA, AUDITOR, INACTIVO)
   * 'purple'  -> morado (ADMIN)
   */
  @Input() type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' = 'neutral';

  getClasses() {
    const base = {
      'success': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'warning': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      'danger': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'info': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      'neutral': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    };
    return base[this.type] || base['neutral'];
  }

  isPending() { return this.status?.toUpperCase() === 'PENDIENTE'; }
  isActive() { return this.status?.toUpperCase() === 'ACTIVO'; }
}