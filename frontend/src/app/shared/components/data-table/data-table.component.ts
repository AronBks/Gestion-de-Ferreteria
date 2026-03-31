import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      
      <!-- Toolbar -->
      <div class="p-4 border-b border-border dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
        @if (searchable) {
          <div class="relative w-full sm:w-72">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="onSearch()"
              [placeholder]="searchPlaceholder"
              class="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-shadow"
            >
          </div>
        }
        <div class="flex gap-2 ml-auto">
          <ng-content select="[toolbar]"></ng-content>
        </div>
      </div>

      <!-- Table Scrollable Area -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap text-text-secondary dark:text-gray-300">
          <thead class="text-xs uppercase bg-gray-50/50 text-text-tertiary font-semibold dark:bg-gray-900/50 dark:text-gray-400">
            <tr>
              @for (col of columns; track col.key) {
                <th scope="col" class="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    (click)="sortBy(col.key)">
                  <div class="flex items-center gap-2">
                    {{ col.label }}
                    @if (sortKey === col.key) {
                      <span class="material-icons text-[16px]">
                        {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                      </span>
                    } @else if(col.sortable !== false) {
                      <span class="material-icons text-[16px] opacity-0 hover:opacity-50">sort</span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          
          <tbody class="divide-y divide-border dark:divide-gray-700">
            @if (loading) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr class="animate-pulse">
                  @for (col of columns; track col.key) {
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
                  }
                </tr>
              }
            } @else if (data.length === 0) {
              <tr>
                <td [attr.colspan]="columns.length" class="px-6 py-12 text-center text-gray-500">
                  No se encontraron registros.
                </td>
              </tr>
            } @else {
              @for (row of paginatedData; track row.id || $index) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  @for (col of columns; track col.key) {
                    <td class="px-6 py-4">
                      <!-- Renderización dinámica mediante TemplateRef o campo directo -->
                      <ng-container *ngTemplateOutlet="cellTemplate || defaultCell; context: { $implicit: row, col: col }"></ng-container>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Footer Paginación -->
      @if (data.length > 0 && pagination) {
        <div class="px-6 py-4 border-t border-border dark:border-gray-700 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ min(currentPage * pageSize, filteredData.length) }} de {{ filteredData.length }}
          </span>
          <div class="flex gap-1">
            <button 
              [disabled]="currentPage === 1" 
              (click)="currentPage = currentPage - 1"
              class="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <span class="material-icons text-sm">chevron_left</span>
            </button>
            <button 
              [disabled]="currentPage * pageSize >= filteredData.length" 
              (click)="currentPage = currentPage + 1"
              class="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <span class="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      }
    </div>

    <ng-template #defaultCell let-row let-col="col">
      {{ row[col.key] }}
    </ng-template>
  `
})
export class DataTableComponent {
  @Input() columns: { key: string; label: string; sortable?: boolean }[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Buscar...';
  
  @Input() pagination = true;
  @Input() pageSize = 10;

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;

  searchTerm = '';
  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  get filteredData() {
    let result = [...this.data];

    // Búsqueda simple en todas las propiedades
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(term)
        )
      );
    }

    // Ordenamiento
    if (this.sortKey) {
      result.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }

  get paginatedData() {
    if (!this.pagination) return this.filteredData;
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  min(a: number, b: number) { return Math.min(a, b); }

  onSearch() {
    this.currentPage = 1; // reset page
  }

  sortBy(key: string) {
    const col = this.columns.find(c => c.key === key);
    if (col?.sortable === false) return;

    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }
}