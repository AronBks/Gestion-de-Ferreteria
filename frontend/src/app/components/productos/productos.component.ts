import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { ProductoViewDetailsComponent } from './producto-view-details/producto-view-details.component';
import { ProductosService } from '../../services/productos.service';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoryName: string;           // ✅ NUEVA: Nombre de la categoría
  costoBs: number;
  precioBs: number;
  ganancia: number;
  gananciaPercent: number;
  stock: number;
  estado: boolean;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoFormComponent, DeleteConfirmationComponent, ProductoViewDetailsComponent],
  template: `
    <div class="productos-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Gestión de Productos</h1>
          <p class="subtitle">{{ productos.length }} productos registrados • Precios en Bs.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalNuevo()">
          <span style="font-size: 18px; line-height: 1;">➕</span>
          Nuevo Producto
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-bar">
          <span style="font-size: 18px; line-height: 1; margin-right: 8px;">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, código..."
            [(ngModel)]="searchTerm"
            (input)="filtrar()">
        </div>

        <div class="filters">
          <select [(ngModel)]="filtroCategoria" (change)="filtrar()" class="select-filter">
            <option value="">Todas las categorías</option>
            <option *ngFor="let cat of categoriasUnicas" [value]="cat">{{ cat }}</option>
          </select>

          <select [(ngModel)]="filtroEstado" (change)="filtrar()" class="select-filter">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <button class="btn btn-ghost" *ngIf="searchTerm || filtroCategoria || filtroEstado" (click)="limpiarFiltros()">
            <span style="font-size: 18px; line-height: 1;">✕</span>
            Limpiar
          </button>
        </div>

        <div class="view-toggle">
          <button class="toggle-btn active" title="Vista tabla">
            <span style="font-size: 18px; line-height: 1;">☰</span>
          </button>
          <button class="toggle-btn" title="Vista grid">
            <span style="font-size: 18px; line-height: 1;">⊞</span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="productos-table">
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>NOMBRE</th>
              <th>DESCRIPCIÓN</th>
              <th>CATEGORÍA</th>
              <th>COSTO Bs.</th>
              <th>PRECIO Bs.</th>
              <th>GANANCIA</th>
              <th>STOCK</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let producto of productosFiltrados" class="table-row">
              <td data-label="CÓDIGO">
                <span class="badge-code">{{ producto.codigo }}</span>
              </td>
              <td data-label="NOMBRE">
                <span class="product-name">{{ producto.nombre }}</span>
              </td>
              <td data-label="DESCRIPCIÓN">
                <span class="text-secondary" [title]="producto.descripcion">
                  {{ producto.descripcion | slice:0:40 }}{{ producto.descripcion.length > 40 ? '...' : '' }}
                </span>
              </td>
              <td data-label="CATEGORÍA">
                <span class="badge-categoria">{{ producto.categoryName }}</span>
              </td>
              <td data-label="COSTO">{{ producto.costoBs | number:'1.0-2' }}</td>
              <td data-label="PRECIO" class="price-cell">
                {{ producto.precioBs | number:'1.0-2' }}
              </td>
              <td data-label="GANANCIA">
                <span class="badge-ganancia">
                  Bs. {{ producto.ganancia | number:'1.0-2' }}
                  <span *ngIf="producto.gananciaPercent > 50" class="fire">🔥</span>
                </span>
              </td>
              <td data-label="STOCK">
                <span [class]="'stock-badge stock-' + getStockLevel(producto.stock)">
                  {{ producto.stock }}
                  <span style="font-size: 14px; margin-left: 4px;" *ngIf="producto.stock < 20">⚠️</span>
                </span>
              </td>
              <td data-label="ESTADO">
                <label class="switch">
                  <input type="checkbox" [checked]="producto.estado" (change)="toggleEstado(producto)">
                  <span class="slider"></span>
                </label>
              </td>
              <td data-label="ACCIONES" class="acciones-cell">
                <button class="action-btn edit" (click)="editar(producto)" title="Editar">
                  <span style="font-size: 16px; line-height: 1;">✏️</span>
                </button>
                <button class="action-btn delete" (click)="eliminar(producto)" title="Eliminar">
                  <span style="font-size: 16px; line-height: 1;">🗑️</span>
                </button>
                <button class="action-btn view" (click)="ver(producto)" title="Ver detalles">
                  <span style="font-size: 16px; line-height: 1;">👁️</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <p class="pagination-info">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} - 
          {{ Math.min(currentPage * itemsPerPage, productosFiltrados.length) }} 
          de {{ productosFiltrados.length }} productos
        </p>
        <div class="pagination-controls">
          <button [disabled]="currentPage === 1">← Anterior</button>
          <div class="page-numbers">
            <button *ngFor="let page of getPages()" 
              [class.active]="page === currentPage"
              (click)="currentPage = page">
              {{ page }}
            </button>
          </div>
          <button [disabled]="currentPage === getTotalPages()">Siguiente →</button>
        </div>
        <select [(ngModel)]="itemsPerPage" (change)="currentPage = 1">
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>

      <!-- Modal: Nuevo/Editar Producto -->
      <app-producto-form 
        [isVisible]="mostrarFormulario"
        [producto]="productoEdicion"
        (close)="cerrarFormulario()"
        (saved)="guardarProducto($event)">
      </app-producto-form>

      <!-- Modal: Confirmación de Eliminación -->
      <app-delete-confirmation
        [isVisible]="mostrarConfirmacion"
        [titulo]="'Eliminar Producto'"
        [mensaje]="'¿Estás seguro de que deseas eliminar el producto: ' + (productoAEliminar?.nombre || '') + '?'"
        (confirm)="confirmarEliminacion()"
        (cancel)="cancelarEliminacion()">
      </app-delete-confirmation>

      <!-- Modal: Ver Detalles del Producto -->
      <app-producto-view-details
        [isVisible]="mostrarDetalles"
        [producto]="productoVisualizando"
        (close)="cerrarDetalles()">
      </app-producto-view-details>
    </div>
  `,
  styles: [`
    .productos-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
      animation: fadeInUp 0.3s ease-out;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-xl);
    }

    .page-header h1 {
      font: var(--font-display-md);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .subtitle {
      font: 400 0.95rem / 1.5 var(--font-family-body);
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font: 600 0.95rem / 1 var(--font-family-body);
      border: none;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .btn-primary {
      background-color: var(--color-accent-primary);
      color: #000;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-ghost {
      background-color: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .btn-ghost:hover {
      background-color: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: var(--spacing-lg);
      align-items: center;
      flex-wrap: wrap;
    }

    .search-bar {
      flex: 1;
      min-width: 250px;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: 0 var(--spacing-md);
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
    }

    .search-bar:focus-within {
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .search-bar input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      padding: 10px 0;
      font: 400 0.95rem / 1.5 var(--font-family-body);
      color: var(--color-text-primary);
    }

    .search-bar input::placeholder {
      color: var(--color-text-tertiary);
    }

    .filters {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }

    .select-filter {
      padding: 10px 12px;
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font: 400 0.95rem / 1 var(--font-family-body);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .select-filter:hover,
    .select-filter:focus {
      border-color: var(--color-accent-primary);
    }

    .view-toggle {
      display: flex;
      gap: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 4px;
      background-color: var(--color-bg-secondary);
    }

    .toggle-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all var(--transition-base);
      border-radius: var(--radius-sm);
    }

    .toggle-btn.active,
    .toggle-btn:hover {
      background-color: var(--color-accent-primary);
      color: #000;
    }

    /* Table */
    .table-container {
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .productos-table {
      width: 100%;
      border-collapse: collapse;
    }

    .productos-table thead {
      background-color: var(--color-bg-tertiary);
    }

    .productos-table th {
      padding: var(--spacing-md);
      text-align: left;
      font: 600 0.75rem / 1.5 var(--font-family-body);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: none;
      font-weight: 600;
    }

    .table-row {
      border-bottom: 1px solid var(--color-border);
      transition: background-color var(--transition-base);
      height: 56px;
    }

    .table-row:hover {
      background-color: var(--color-bg-tertiary);
    }

    .productos-table td {
      padding: var(--spacing-md);
      font: 400 0.9rem / 1.5 var(--font-family-body);
      color: var(--color-text-primary);
    }

    .badge-code {
      display: inline-block;
      padding: 4px 10px;
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--color-accent-primary);
      border-radius: var(--radius-md);
      font-family: var(--font-family-mono);
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* ✅ NUEVO: Estilo para badge de categoría */
    .badge-categoria {
      display: inline-block;
      padding: 6px 12px;
      background-color: rgba(99, 102, 241, 0.1);
      color: rgb(99, 102, 241);
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .product-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .text-secondary {
      color: var(--color-text-secondary);
      pointer-events: none;
    }

    .price-cell {
      color: var(--color-success);
      font-weight: 600;
    }

    .badge-ganancia {
      display: inline-block;
      padding: 4px 10px;
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fire {
      font-size: 0.95rem;
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .stock-normal {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--color-info);
    }

    .stock-warning {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--color-warning);
    }

    .stock-critical {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--color-border);
      transition: var(--transition-base);
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: var(--transition-base);
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--color-success);
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    /* Actions */
    .acciones-cell {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: center;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background: none;
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .action-btn.edit {
      color: var(--color-info);
    }

    .action-btn.edit:hover {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: var(--color-info);
    }

    .action-btn.delete {
      color: var(--color-danger);
    }

    .action-btn.delete:hover {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: var(--color-danger);
    }

    .action-btn.view {
      color: var(--color-text-secondary);
    }

    .action-btn.view:hover {
      background-color: var(--color-bg-tertiary);
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      flex-wrap: wrap;
    }

    .pagination-info {
      font: 400 0.9rem / 1.5 var(--font-family-body);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .pagination-controls button,
    .pagination select {
      padding: 8px 12px;
      background-color: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font: 500 0.9rem / 1 var(--font-family-body);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .pagination-controls button:hover:not(:disabled),
    .pagination select:hover {
      border-color: var(--color-accent-primary);
      background-color: rgba(245, 158, 11, 0.1);
    }

    .pagination-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: var(--spacing-xs);
    }

    .page-numbers button {
      min-width: 32px;
      height: 32px;
      padding: 0;
    }

    .page-numbers button.active {
      background-color: var(--color-accent-primary);
      color: #000;
      border-color: var(--color-accent-primary);
    }

    /* Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .toolbar {
        gap: var(--spacing-md);
      }

      .search-bar {
        flex: 1;
        min-width: 200px;
      }

      .filters {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-bar {
        flex: none;
      }

      .filters {
        width: 100%;
      }

      .select-filter {
        flex: 1;
      }

      .productos-table th,
      .productos-table td {
        padding: var(--spacing-sm);
        font-size: 0.8rem;
      }

      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-info,
      .pagination-controls {
        width: 100%;
      }

      .page-numbers {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .productos-table {
        font-size: 0.8rem;
      }

      .table-row {
        height: auto;
      }

      .acciones-cell {
        gap: 4px;
      }

      .action-btn {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class ProductosComponent implements OnInit {
  Math = Math;
  
  // Estado de modales
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  mostrarDetalles = false;
  productoEdicion: any = null;
  productoAEliminar: Producto | null = null;
  productoVisualizando: Producto | null = null;
  
  // ← DATOS DEL BACKEND, NO HARDCODEADOS
  productos: Producto[] = [];
  
  // Estado de carga
  cargando = false;
  errorCarga: string | null = null;

  productosFiltrados: Producto[] = [];
  searchTerm = '';
  filtroCategoria = '';
  filtroEstado = '';
  currentPage = 1;
  itemsPerPage = 10;
  categoriasUnicas: string[] = []; // ✅ NUEVA: Categorías dinámicas

  constructor(
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductosDelBackend();
  }

  /**
   * CRÍTICO: Cargar datos reales del backend (NO datos hardcodeados)
   */
  private cargarProductosDelBackend(): void {
    this.cargando = true;
    this.errorCarga = null;
    
    this.productosService.obtenerProductos(1, 100).subscribe({
      next: (response: any) => {
        if (response.data && Array.isArray(response.data)) {
          this.productos = response.data.map((p: any) => ({
            id: p.id,
            codigo: p.codigo_producto,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            categoryName: p.categoria?.nombre || 'Sin categoría', // ✅ Mapear categoría
            costoBs: p.precio_costo,
            precioBs: p.precio_venta,
            ganancia: p.precio_venta - p.precio_costo,
            gananciaPercent: ((p.precio_venta - p.precio_costo) / p.precio_costo) * 100,
            stock: p.stock_actual,
            estado: p.estado === 'ACTIVO'
          }));
          
          // ✅ NUEVA: Extraer categorías únicas para el filtro
          this.categoriasUnicas = [...new Set(this.productos.map(p => p.categoryName))].sort();
          
          this.filtrar();
          this.cdr.markForCheck();
        }
        
        this.cargando = false;
      },
      error: (err: any) => {
        this.errorCarga = err.error?.message || 'Error al cargar productos del servidor';
        this.cargando = false;
      }
    });
  }

  filtrar(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const matchSearch = this.searchTerm === '' || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // ✅ ARREGLADO: Comparar categoryName correctamente
      const matchCategoria = this.filtroCategoria === '' || 
        p.categoryName === this.filtroCategoria;
      
      const matchEstado = this.filtroEstado === '' || 
        (this.filtroEstado === 'activo' ? p.estado : !p.estado);
      
      return matchSearch && matchCategoria && matchEstado;
    });
    
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroCategoria = '';
    this.filtroEstado = '';
    this.filtrar();
  }

  getStockLevel(stock: number): string {
    if (stock > 100) return 'normal';
    if (stock >= 20) return 'warning';
    return 'critical';
  }

  getStockIcon(stock: number): string {
    return stock < 20 ? 'alert-circle' : 'check-circle';
  }

  toggleEstado(producto: Producto): void {
    const nuevoEstado = producto.estado ? 'INACTIVO' : 'ACTIVO';
    const estadoAnterior = producto.estado;
    
    // Optimistic update: cambiar en UI inmediatamente
    producto.estado = !producto.estado;
    
    // Enviar cambio al backend
    this.productosService.actualizarProducto(producto.id.toString(), { 
      estado: nuevoEstado 
    }).subscribe({
      next: (response: any) => {
        // Estado actualizado correctamente
      },
      error: (err: any) => {
        // Revertir cambio si falla
        producto.estado = estadoAnterior;
        
        const errorMsg = err.error?.message || 'Error al cambiar estado del producto';
        alert(`Error: ${errorMsg}`);
        
        // Recargar datos del backend para sincronizar
        this.cargarProductosDelBackend();
      }
    });
  }

  abrirModalNuevo(): void {
    this.productoEdicion = null; // null = nuevo producto
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.productoEdicion = null;
  }

  guardarProducto(productoFormulario: any): void {
    // Recargar TODOS los productos del backend después de guardar
    this.cargarProductosDelBackend();
    this.cerrarFormulario();
  }

  editar(producto: Producto): void {
    // Convertir Producto local a objeto compatible con ProductoFormComponent
    const productoConvertido = {
      id: producto.id.toString(),
      codigo_producto: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_costo: producto.costoBs,
      precio_venta: producto.precioBs,
      stock_actual: producto.stock,
      estado: producto.estado ? 'activo' : 'inactivo',
      categoria_id: undefined
    };
    this.productoEdicion = productoConvertido as any;
    this.mostrarFormulario = true;
  }

  eliminar(producto: Producto): void {
    this.productoAEliminar = producto;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion(): void {
    if (this.productoAEliminar) {
      // Llamar al backend para eliminar
      this.productosService.eliminarProducto(this.productoAEliminar.id.toString()).subscribe({
        next: (response: any) => {
          // Recargar lista del backend para asegurar sincronización
          this.cargarProductosDelBackend();
        },
        error: (err: any) => {
          alert('Error al eliminar producto: ' + (err.error?.message || 'Intenta de nuevo'));
        }
      });
    }
    this.cancelarEliminacion();
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.productoAEliminar = null;
  }

  ver(producto: Producto): void {
    this.productoVisualizando = producto;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.productoVisualizando = null;
  }

  getPages(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTotalPages(): number {
    return Math.ceil(this.productosFiltrados.length / this.itemsPerPage);
  }
}

