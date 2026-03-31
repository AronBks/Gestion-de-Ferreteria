import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold font-heading text-text-primary dark:text-white flex items-center gap-2">
          @if(icon) { <i class="lucide" [class]="icon"></i> }
          {{ title }}
        </h1>
        @if(subtitle) {
          <p class="text-text-secondary text-sm mt-1 dark:text-gray-400">{{ subtitle }}</p>
        }
      </div>
      
      @if (actionLabel) {
        <button 
          (click)="action.emit()" 
          class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          @if(actionIcon) { <i class="lucide" [class]="actionIcon"></i> }
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  
  @Output() action = new EventEmitter<void>();
}