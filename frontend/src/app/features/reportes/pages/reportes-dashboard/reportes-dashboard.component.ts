import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../services/reportes.service';
import { DashboardResponse, TopProductoStatus, VentaDiaStatus } from '../../models/reportes.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, SkeletonComponent, HasRoleDirective],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto flex flex-col gap-6" *hasRole="['ADMIN', 'GERENTE']">
      <app-page-header 
        title="Reportes y Analíticas" 
        subtitle="Visualiza el rendimiento de la ferretería" 
        icon="analytics"
      >
        <div class="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <button [class]="btnTimeClass(7)" (click)="cambiarDias(7)">7D</button>
          <button [class]="btnTimeClass(30)" (click)="cambiarDias(30)">30D</button>
          <button [class]="btnTimeClass(90)" (click)="cambiarDias(90)">3M</button>
        </div>
      </app-page-header>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <app-skeleton class="h-32 rounded-xl"></app-skeleton>
          <app-skeleton class="h-32 rounded-xl"></app-skeleton>
          <app-skeleton class="h-32 rounded-xl"></app-skeleton>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <app-skeleton class="h-96 rounded-xl lg:col-span-2"></app-skeleton>
          <app-skeleton class="h-96 rounded-xl"></app-skeleton>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <!-- Ingresos -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
            <span class="material-icons absolute -right-4 -bottom-4 text-8xl opacity-20">attach_money</span>
            <span class="text-green-100 text-sm font-semibold uppercase tracking-wider mb-1">Ingresos Totales</span>
            <div class="text-3xl font-bold font-heading">Bs. {{ data()?.resumen?.ingresos | number:'1.2-2' }}</div>
          </div>

          <!-- Total Transacciones -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
            <span class="material-icons absolute -right-4 -bottom-4 text-8xl opacity-20">receipt</span>
            <span class="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Ventas Realizadas</span>
            <div class="text-3xl font-bold font-heading">{{ data()?.resumen?.totalVentas }} <span class="text-xl font-medium opacity-80">Tkts</span></div>
          </div>

          <!-- Ticket Promedio -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
            <span class="material-icons absolute -right-4 -bottom-4 text-8xl opacity-20">shopping_cart</span>
            <span class="text-purple-100 text-sm font-semibold uppercase tracking-wider mb-1">Ticket Promedio</span>
            <div class="text-3xl font-bold font-heading">Bs. {{ data()?.resumen?.ticketPromedio | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Chart Column / Ventas dia -->
          <div class="lg:col-span-2 bg-surface rounded-xl border border-border dark:bg-gray-800 dark:border-gray-700 p-6 flex flex-col shadow-sm">
            <h3 class="text-lg font-bold font-heading mb-6 dark:text-white flex items-center gap-2">
              <span class="material-icons text-amber-500">trending_up</span> Evolución de Ingresos
            </h3>
            
            <div class="flex-1 flex items-end gap-2 h-64 mt-auto border-b border-gray-200 dark:border-gray-700 relative">
              <!-- Y Axis Lines -->
              <div class="absolute inset-x-0 bottom-1/3 border-b border-dashed border-gray-200 dark:border-gray-700 -z-10"></div>
              <div class="absolute inset-x-0 bottom-2/3 border-b border-dashed border-gray-200 dark:border-gray-700 -z-10"></div>

              @for (v of data()?.ventasPorDia; track v.fecha) {
                <div class="relative flex-1 bg-amber-200 dark:bg-amber-900/40 rounded-t-sm hover:opacity-80 transition-opacity group cursor-pointer"
                     [style.height.%]="getBarHeight(v.total)">
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {{ v.fecha | date:'shortDate' }}: Bs {{ v.total }}<br>
                    {{ v.transacciones }} ventas
                  </div>
                  <div class="absolute top-0 inset-x-0 bg-amber-500 rounded-t-sm" style="height: 4px;"></div>
                </div>
              }
              
              @if (data()?.ventasPorDia?.length === 0) {
                <div class="absolute inset-0 flex justify-center items-center text-sm text-gray-400">
                  No hay datos suficientes en este periodo.
                </div>
              }
            </div>
            
            <!-- X Axis Labels (Simple) -->
            <div class="flex justify-between text-[10px] text-gray-500 font-medium mt-2 uppercase">
              <span>{{ firstDate() | date:'dd MMM' }}</span>
              <span>{{ lastDate() | date:'dd MMM' }}</span>
            </div>
          </div>

          <!-- Top Productos List -->
          <div class="bg-surface rounded-xl border border-border dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
            <h3 class="text-lg font-bold font-heading mb-6 dark:text-white flex items-center gap-2">
              <span class="material-icons text-amber-500">star</span> Productos Top
            </h3>

            <div class="flex flex-col gap-4">
              @for (p of data()?.topProductos; track p.nombre; let i = $index) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">
                     {{ i + 1 }}. {{ p.nombre }}
                    </span>
                    <span class="font-bold text-amber-600 dark:text-amber-400">{{ p.cantidadVendida }}</span>
                  </div>
                  
                  <div class="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                    <div class="bg-amber-500 h-2.5 rounded-full relative" [style.width.%]="getTopProductWidth(p.cantidadVendida)">
                      <div class="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                  <p class="text-[10px] text-gray-500 mt-0.5 text-right">Bs. {{ p.ingresos | number:'1.2-2' }}</p>
                </div>
              }

              @if (data()?.topProductos?.length === 0) {
                 <div class="text-center py-6 text-sm text-gray-400">
                  Sin ventas top aún.
                </div>
              }
            </div>

          </div>

        </div>
      }

    </div>
  `
})
export class ReportesDashboardComponent implements OnInit {
  private reportesService = inject(ReportesService);

  loading = signal(true);
  dias = signal(30);
  data = signal<DashboardResponse | null>(null);

  // Computados
  maxVentaTotal = computed(() => {
    const list = this.data()?.ventasPorDia;
    if (!list || list.length === 0) return 1;
    return Math.max(...list.map(v => v.total));
  });

  maxTopProduct = computed(() => {
    const list = this.data()?.topProductos;
    if (!list || list.length === 0) return 1;
    return Math.max(...list.map(p => p.cantidadVendida));
  });

  firstDate = computed(() => {
    const arr = this.data()?.ventasPorDia || [];
    return arr.length > 0 ? arr[0].fecha : null;
  });

  lastDate = computed(() => {
    const arr = this.data()?.ventasPorDia || [];
    return arr.length > 0 ? arr[arr.length - 1].fecha : null;
  });

  ngOnInit() {
    this.cargarDatos();
  }

  cambiarDias(d: number) {
    this.dias.set(d);
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.reportesService.getDashboard(this.dias()).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  btnTimeClass(d: number) {
    const isActivo = this.dias() === d;
    return `px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
      isActivo 
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-400' 
        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
    }`;
  }

  getBarHeight(total: number) {
    const h = (total / this.maxVentaTotal()) * 100;
    return Math.max(h, 2); // al menos 2% de alto para verse
  }

  getTopProductWidth(vendidos: number) {
    const w = (vendidos / this.maxTopProduct()) * 100;
    return Math.max(w, 2); 
  }
}