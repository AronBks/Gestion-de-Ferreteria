import {
  Component, OnInit, OnDestroy, AfterViewInit,
  inject, signal, computed, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../services/reportes.service';
import {
  ReporteResponse, ReporteFiltros, CategoriaFiltro
} from '../../models/reportes.model';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-dashboard.component.html',
  styleUrls: ['./reportes-dashboard.component.scss'],
  providers: [DecimalPipe, DatePipe]
})
export class ReportesDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private reportesService = inject(ReportesService);
  private decimalPipe = inject(DecimalPipe);

  // ============================================================
  // CANVAS REFS para Chart.js
  // ============================================================
  @ViewChild('lineChartCanvas') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private barChart?: Chart;
  private themeObserver?: MutationObserver;

  // ============================================================
  // STATE — Signals
  // ============================================================
  loading = signal(true);
  data = signal<ReporteResponse | null>(null);
  categorias = signal<CategoriaFiltro[]>([]);
  errorMsg = signal('');

  // Filtros — NO se disparan automáticamente, solo con "Aplicar"
  rangoActivo = signal<string>('30d');
  filtroFechaInicio = signal('');
  filtroFechaFin = signal('');
  filtroCategoria = signal('');
  filtroMetodoPago = signal('');
  mostrarFechasCustom = signal(false);

  // Paginación
  currentPage = signal(1);
  pageSize = signal(10);

  // Exportando
  exportando = signal(false);

  // Métodos de pago disponibles
  metodosPago = [
    { value: '', label: 'Todos' },
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito' },
    { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'CHEQUE', label: 'Cheque' },
  ];

  // ============================================================
  // COMPUTED
  // ============================================================
  totalPages = computed(() => this.data()?.tablaVentas?.totalPages || 1);
  totalRegistros = computed(() => this.data()?.tablaVentas?.total || 0);

  paginasVisibles = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  rangoLabel = computed(() => {
    const f = this.data()?.filtrosAplicados;
    if (!f) return '';
    return `${this.formatDateLabel(f.fechaInicio)} — ${this.formatDateLabel(f.fechaFin)}`;
  });

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    this.cargarCategorias();
    this.aplicarRangoRapido('30d');
  }

  ngAfterViewInit(): void {
    // Observar cambios de tema para actualizar Chart.js
    this.themeObserver = new MutationObserver(() => {
      this.actualizarTemasGraficos();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this.barChart?.destroy();
    this.themeObserver?.disconnect();
  }

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  private cargarCategorias(): void {
    this.reportesService.getCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: () => this.categorias.set([])
    });
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    const filtros = this.construirFiltros();
    filtros.page = this.currentPage();
    filtros.limit = this.pageSize();

    this.reportesService.getReportesData(filtros).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        // Render charts after data loads
        setTimeout(() => this.renderizarGraficos(), 100);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set('Error al cargar los datos. Verifica la conexión con el servidor.');
        console.error('[Reportes] Error:', err);
      }
    });
  }

  private construirFiltros(): ReporteFiltros {
    const filtros: ReporteFiltros = {};

    if (this.filtroFechaInicio()) filtros.fechaInicio = this.filtroFechaInicio();
    if (this.filtroFechaFin()) filtros.fechaFin = this.filtroFechaFin();
    if (this.filtroCategoria()) filtros.categoriaId = this.filtroCategoria();
    if (this.filtroMetodoPago()) filtros.metodoPago = this.filtroMetodoPago();

    return filtros;
  }

  // ============================================================
  // FILTROS — Acciones del usuario
  // ============================================================
  aplicarRangoRapido(rango: string): void {
    this.rangoActivo.set(rango);
    this.mostrarFechasCustom.set(rango === 'custom');

    const hoy = new Date();
    const fin = this.formatDate(hoy);
    let inicio = '';

    switch (rango) {
      case 'hoy':
        inicio = fin;
        break;
      case '7d':
        inicio = this.formatDate(this.restarDias(hoy, 7));
        break;
      case '30d':
        inicio = this.formatDate(this.restarDias(hoy, 30));
        break;
      case '90d':
        inicio = this.formatDate(this.restarDias(hoy, 90));
        break;
      case 'custom':
        // No auto-cargar, esperar a que el usuario ponga fechas y pulse Aplicar
        return;
    }

    this.filtroFechaInicio.set(inicio);
    this.filtroFechaFin.set(fin);
    this.currentPage.set(1);
    this.cargarDatos();
  }

  aplicarFiltros(): void {
    this.currentPage.set(1);
    this.cargarDatos();
  }

  limpiarFiltros(): void {
    this.filtroCategoria.set('');
    this.filtroMetodoPago.set('');
    this.mostrarFechasCustom.set(false);
    this.aplicarRangoRapido('30d');
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================
  irAPagina(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.cargarDatos();
  }

  cambiarPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.cargarDatos();
  }

  // ============================================================
  // EXPORTACIÓN
  // ============================================================
  exportarCSV(): void {
    this.exportando.set(true);
    const filtros = this.construirFiltros();

    this.reportesService.getExportData(filtros).subscribe({
      next: (res) => {
        // Generar CSV
        const headers = res.headers.join(',');
        const rows = res.rows.map(r =>
          [
            r.numeroVenta, r.fecha, `"${r.cliente}"`, r.documento,
            r.subtotal, r.descuento, r.total, r.metodoPago,
            r.estado, `"${r.vendedor}"`, `"${r.productos}"`
          ].join(',')
        );
        const csv = [headers, ...rows].join('\n');

        // Descargar
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_ventas_${this.filtroFechaInicio()}_${this.filtroFechaFin()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        this.exportando.set(false);
      },
      error: () => {
        this.exportando.set(false);
        alert('Error al exportar los datos.');
      }
    });
  }

  exportarPDF(): void {
    window.print();
  }

  // ============================================================
  // CHART.JS — Renderizado y configuración
  // ============================================================
  private renderizarGraficos(): void {
    this.renderLineChart();
    this.renderBarChart();
  }

  private renderLineChart(): void {
    if (!this.lineChartRef?.nativeElement) return;
    const d = this.data();
    if (!d || !d.ventasPorDia.length) return;

    // Destruir instancia previa
    this.lineChart?.destroy();

    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = this.getThemeColors();
    const labels = d.ventasPorDia.map(v => {
      const date = new Date(v.fecha + 'T00:00:00');
      return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
    });
    const values = d.ventasPorDia.map(v => v.total);
    const txns = d.ventasPorDia.map(v => v.transacciones);

    // Gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos (Bs)',
          data: values,
          borderColor: '#F59E0B',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 7,
          pointBackgroundColor: '#F59E0B',
          pointBorderColor: colors.cardBg,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#F59E0B',
          pointHoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "'DM Sans', sans-serif", weight: 'bold', size: 13 },
            bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
            displayColors: false,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const v = d.ventasPorDia[idx];
                const date = new Date(v.fecha + 'T00:00:00');
                return date.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
              },
              label: (item) => {
                const idx = item.dataIndex;
                return [
                  `Ingresos: Bs. ${this.decimalPipe.transform(values[idx], '1.2-2')}`,
                  `Transacciones: ${txns[idx]}`
                ] as any;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'DM Sans', sans-serif", size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
            border: { color: colors.gridColor }
          },
          y: {
            grid: {
              color: colors.gridColor,
            },
            ticks: {
              color: colors.textColor,
              font: { family: "'DM Sans', sans-serif", size: 11 },
              callback: (val) => {
                const n = Number(val);
                return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
              },
              padding: 8,
            },
            border: { display: false },
            beginAtZero: true,
          }
        },
        animation: {
          duration: 800,
          easing: 'easeInOutQuart',
        }
      }
    });
  }

  private renderBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    const d = this.data();
    if (!d || !d.topProductos.length) return;

    this.barChart?.destroy();

    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = this.getThemeColors();
    const labels = d.topProductos.map(p => this.truncarTexto(p.nombre, 22));
    const values = d.topProductos.map(p => p.cantidadVendida);
    const ingresos = d.topProductos.map(p => p.ingresos);

    // Colores degradados por ranking
    const barColors = [
      '#F59E0B', '#F6A723', '#F7B03B', '#F8B953', '#F9C26B',
      '#FACB83', '#FBD49B', '#FCDDB3', '#FDE6CB', '#FEEFE3'
    ];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Unidades Vendidas',
          data: values,
          backgroundColor: barColors.slice(0, values.length),
          borderColor: barColors.slice(0, values.length).map(c => c),
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "'DM Sans', sans-serif", weight: 'bold', size: 13 },
            bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
            displayColors: false,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                return d.topProductos[idx].nombre;
              },
              label: (item) => {
                const idx = item.dataIndex;
                return [
                  `Vendidos: ${values[idx]} uds`,
                  `Ingresos: Bs. ${this.decimalPipe.transform(ingresos[idx], '1.2-2')}`,
                ] as any;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'DM Sans', sans-serif", size: 11 },
              stepSize: 1,
            },
            border: { display: false },
            beginAtZero: true,
          },
          y: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'DM Sans', sans-serif", size: 11, weight: 'bold' },
              padding: 8,
            },
            border: { color: colors.gridColor },
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        }
      }
    });
  }

  // ============================================================
  // TEMA — Colores dinámicos para Chart.js
  // ============================================================
  private getThemeColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      textColor: dark ? '#94A3B8' : '#64748B',
      gridColor: dark ? 'rgba(45, 55, 72, 0.5)' : 'rgba(226, 232, 240, 0.8)',
      tooltipBg: dark ? '#1E2333' : '#FFFFFF',
      tooltipText: dark ? '#F1F5F9' : '#0F172A',
      tooltipBorder: dark ? '#2D3748' : '#E2E8F0',
      cardBg: dark ? '#1E2333' : '#FFFFFF',
    };
  }

  private actualizarTemasGraficos(): void {
    // Re-renderizar con nuevos colores cuando cambia el tema
    if (this.data()) {
      setTimeout(() => this.renderizarGraficos(), 50);
    }
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private restarDias(date: Date, dias: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - dias);
    return d;
  }

  private truncarTexto(text: string, max: number): string {
    return text.length > max ? text.substring(0, max) + '…' : text;
  }

  formatDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  formatMetodoPago(metodo: string): string {
    const map: Record<string, string> = {
      'EFECTIVO': 'Efectivo',
      'TARJETA_DEBITO': 'T. Débito',
      'TARJETA_CREDITO': 'T. Crédito',
      'TRANSFERENCIA': 'Transferencia',
      'CHEQUE': 'Cheque',
    };
    return map[metodo] || metodo;
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'COMPLETADA': 'estado-completada',
      'PENDIENTE': 'estado-pendiente',
      'CANCELADA': 'estado-cancelada',
      'DEVUELTA': 'estado-devuelta',
    };
    return map[estado] || '';
  }

  getTrendIcon(value: number): string {
    return value >= 0 ? '↑' : '↓';
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}