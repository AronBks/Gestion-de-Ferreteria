import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalProducts: number = 0;
  totalPages: number = 1;
  searchTerm: string = '';
  errorMessage: string = '';

  constructor(private productosService: ProductosService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productosService.obtenerProductos(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.productos = response.data;
        this.totalProducts = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los productos';
        console.error('Error:', err);
      }
    });
  }

  eliminarProducto(id: string, nombre: string): void {
    if (confirm(`¿Deseas eliminar el producto "${nombre}"?`)) {
      this.productosService.eliminarProducto(id).subscribe({
        next: () => {
          this.errorMessage = '';
          this.cargarProductos();
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar el producto';
          console.error('Error:', err);
        }
      });
    }
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
}
