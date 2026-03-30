import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { CurrencyBoliviaPipe } from '../../pipes/currency-bolivia.pipe';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyBoliviaPipe,
    ProductoFormComponent,
    DeleteConfirmationComponent
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductosComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalProducts: number = 0;
  totalPages: number = 1;
  searchTerm: string = '';
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  // Modal estados
  showFormModal = false;
  showDeleteModal = false;
  selectedProducto: Producto | null = null;
  selectedProductoForDelete: Producto | null = null;

  constructor(
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.productosService.obtenerProductos(this.currentPage, this.pageSize)
      .pipe(
        timeout(10000), // 10 segundos timeout
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.productos = response.data || [];
          this.totalProducts = response.total || 0;
          this.totalPages = response.totalPages || 1;
          this.loading = false;
          this.errorMessage = '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.loading = false;
          this.productos = [];
          this.errorMessage = 'Error al cargar los productos. Intenta nuevamente.';
          this.cdr.markForCheck();
        }
      });
  }

  // Modal de Crear Producto
  abrirModalCrear(): void {
    this.selectedProducto = null;
    this.showFormModal = true;
    this.cdr.markForCheck();
  }

  // Modal de Editar Producto
  abrirModalEditar(producto: Producto): void {
    console.log('✏️  Editando:', producto.nombre, '- ID:', producto.id);
    this.selectedProducto = producto;
    this.showFormModal = true;
    this.cdr.markForCheck();
    // Forzar segunda detección de cambios para que los inputs hijos se actualicen
    setTimeout(() => this.cdr.markForCheck(), 0);
  }

  // Cerrar Modal de Formulario
  cerrarModalForm(): void {
    this.showFormModal = false;
    this.selectedProducto = null;
    this.cdr.markForCheck();
  }

  // Al guardar producto
  onProductoGuardado(producto: Producto): void {
    this.cargarProductos();
  }

  // Modal de Eliminar
  abrirModalEliminar(producto: Producto): void {
    console.log('🗑️  Eliminando:', producto.nombre, '- ID:', producto.id);
    this.selectedProductoForDelete = producto;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
    // Forzar segunda detección de cambios
    setTimeout(() => this.cdr.markForCheck(), 0);
  }

  // Cerrar Modal de Eliminar
  cerrarModalDelete(): void {
    console.log('ProductosComponent: Cerrando modal de eliminación');
    this.showDeleteModal = false;
    this.selectedProductoForDelete = null;
    this.cdr.markForCheck();
  }

  // Al confirmar eliminación
  onProductoEliminado(): void {
    console.log('✅ ProductosComponent: Producto eliminado, recargando lista...');
    this.cerrarModalDelete();
    this.cargarProductos();
  }

  siguientePagina(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarProductos();
    }
  }

  paginaAnterior(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarProductos();
    }
  }

  calcularGanancia(producto: Producto): number {
    return producto.precio_venta - producto.precio_costo;
  }

  obtenerEstadoBadge(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return 'badge-success';
      case 'INACTIVO':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
