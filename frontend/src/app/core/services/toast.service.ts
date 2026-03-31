import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const id = ++this.idCounter;
    const newToast = { id, message, type };
    
    this.toasts.update(t => [...t, newToast]);

    // Eliminar automáticamente después de 3 segundos
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  showSuccess(message: string) { this.show(message, 'success'); }
  showError(message: string) { this.show(message, 'error'); }
  showWarning(message: string) { this.show(message, 'warning'); }
}