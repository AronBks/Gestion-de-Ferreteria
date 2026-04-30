import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="confirm-overlay" (click)="close.emit()">
        <div class="confirm-card animate-zoom" (click)="$event.stopPropagation()">
          <div class="confirm-header" [attr.data-type]="type">
            <div class="icon-circle">
              <span class="material-symbols-outlined">{{ getIcon() }}</span>
            </div>
            <h3>{{ title }}</h3>
          </div>
          
          <div class="confirm-body">
            <p>{{ message }}</p>
          </div>
          
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="close.emit()">
              {{ cancelText }}
            </button>
            <button class="btn-confirm" [attr.data-type]="type" (click)="confirm.emit()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }

    .confirm-card {
      background-color: var(--color-bg-secondary);
      width: 100%;
      max-width: 420px;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }

    .confirm-header {
      padding: 32px 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .confirm-header[data-type="danger"] .icon-circle { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .confirm-header[data-type="warning"] .icon-circle { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .confirm-header[data-type="info"] .icon-circle { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

    .icon-circle span { font-size: 32px; }

    .confirm-header h3 {
      margin: 0;
      font: var(--font-display-sm);
      color: var(--color-text-primary);
    }

    .confirm-body {
      padding: 0 32px 32px;
      text-align: center;
    }

    .confirm-body p {
      margin: 0;
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .confirm-actions {
      padding: 16px 24px;
      background-color: rgba(255, 255, 255, 0.02);
      border-top: 1px solid var(--color-border);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-cancel {
      padding: 12px;
      border-radius: var(--radius-md);
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }

    .btn-confirm {
      padding: 12px;
      border-radius: var(--radius-md);
      border: none;
      color: white;
      font-weight: 700;
      transition: all 0.2s;
    }
    .btn-confirm[data-type="danger"] { background: #ef4444; }
    .btn-confirm[data-type="danger"]:hover { background: #dc2626; transform: translateY(-1px); }
    
    .btn-confirm[data-type="warning"] { background: #f59e0b; color: #1a1a1a; }
    .btn-confirm[data-type="warning"]:hover { background: #d97706; transform: translateY(-1px); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-zoom { animation: zoomIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
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

  getIcon(): string {
    return {
      'danger': 'delete_forever',
      'warning': 'warning',
      'info': 'info'
    }[this.type];
  }
}