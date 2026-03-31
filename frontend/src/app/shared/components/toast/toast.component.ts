import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100"
          [ngClass]="{
            'bg-green-100 text-green-800 border-l-4 border-green-500': toast.type === 'success',
            'bg-red-100 text-red-800 border-l-4 border-red-500': toast.type === 'error',
            'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500': toast.type === 'warning',
            'bg-blue-100 text-blue-800 border-l-4 border-blue-500': toast.type === 'info'
          }"
        >
          <!-- Íconos simples -->
          @if (toast.type === 'success') { <span class="material-icons">check_circle</span> }
          @if (toast.type === 'error') { <span class="material-icons">error</span> }
          @if (toast.type === 'warning') { <span class="material-icons">warning</span> }
          @if (toast.type === 'info') { <span class="material-icons">info</span> }
          
          <span class="font-medium text-sm">{{ toast.message }}</span>
          
          <button (click)="toastService.remove(toast.id)" class="ml-auto opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}