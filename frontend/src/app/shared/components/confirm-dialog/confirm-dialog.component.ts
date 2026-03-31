import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" (click)="close.emit()">
        <div 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all animate-dialog-enter"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                 [class.bg-red-100]="type === 'danger'" [class.text-red-600]="type === 'danger'"
                 [class.bg-blue-100]="type === 'info'" [class.text-blue-600]="type === 'info'"
                 [class.bg-amber-100]="type === 'warning'" [class.text-amber-600]="type === 'warning'">
              <i class="lucide text-2xl" [class]="iconClass()"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end gap-3">
            <button 
              type="button" 
              (click)="close.emit()"
              class="px-4 py-2 font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button"
              (click)="confirm.emit()"
              class="px-4 py-2 font-medium rounded-lg text-white transition-colors"
              [class.bg-red-600]="type === 'danger'" [class.hover:bg-red-700]="type === 'danger'"
              [class.bg-blue-600]="type === 'info'" [class.hover:bg-blue-700]="type === 'info'"
              [class.bg-amber-500]="type === 'warning'" [class.hover:bg-amber-600]="type === 'warning'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes dialogEnter {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-dialog-enter {
      animation: dialogEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = '¿Confirmar acción?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() cancelText = 'Cancelar';
  @Input() confirmText = 'Confirmar';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  iconClass(): string {
    return {
      'danger': 'trash-2',
      'warning': 'alert-triangle',
      'info': 'info'
    }[this.type];
  }
}