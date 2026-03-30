import { Component, EventEmitter, Input, Output, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../../services/productos.service';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() productoId: string | null = null;
  @Input() productoNombre: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  loading = false;
  errorMessage = '';

  constructor(
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: any): void {
    if (changes['isVisible'] || changes['productoId'] || changes['productoNombre']) {
      if (this.cdr?.markForCheck) this.cdr.markForCheck();
    }
  }

  confirm(): void {
    if (!this.productoId) {
      this.errorMessage = 'Error: ID del producto no definido';
      if (this.cdr?.markForCheck) this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    if (this.cdr?.markForCheck) this.cdr.markForCheck();

    this.productosService.eliminarProducto(this.productoId).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (this.cdr?.markForCheck) this.cdr.markForCheck();
        this.confirmed.emit();
        this.closeModal();
      },
      error: (err: any) => {
        this.loading = false;
        
        let mensajeError = 'Error al eliminar el producto';
        if (err.status === 401) {
          mensajeError = 'No autorizado. Por favor inicia sesión nuevamente.';
        } else if (err.status === 404) {
          mensajeError = 'El producto no existe.';
        } else if (err.error?.message) {
          mensajeError = err.error.message;
        } else if (err.error?.Error) {
          mensajeError = err.error.Error;
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        this.errorMessage = mensajeError;
        if (this.cdr?.markForCheck) this.cdr.markForCheck();
      }
    });
  }

  closeModal(): void {
    console.log('DeleteConfirmationComponent: closeModal() ejecutado');
    this.errorMessage = '';
    this.close.emit();
  }
}
