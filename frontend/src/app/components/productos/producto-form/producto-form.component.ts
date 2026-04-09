import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../../models/producto.model';
import { Categoria } from '../../../models/categoria.model';
import { ProductosService } from '../../../services/productos.service';
import { CategoriasService } from '../../../services/categorias.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit, OnChanges {
  @Input() producto: Producto | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Producto>();

  form!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  productoId: string | null = null;
  
  categorias: Categoria[] = [];
  categoriasLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.resetForm();
    this.cargarCategorias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto']) {
      const productoActual = changes['producto'].currentValue;
      
      if (productoActual) {
        this.isEditMode = true;
        this.productoId = productoActual.id;
        
        this.form.patchValue({
          codigo_producto: productoActual.codigo_producto || '',
          nombre: productoActual.nombre || '',
          descripcion: productoActual.descripcion || '',
          categoria_id: productoActual.categoria_id || '',
          precio_costo: productoActual.precio_costo || 0,
          precio_venta: productoActual.precio_venta || 0,
          stock_actual: productoActual.stock_actual || 0,
          estado: productoActual.estado || 'ACTIVO'
        });
      } else {
        this.isEditMode = false;
        this.productoId = null;
        this.resetForm();
      }
    }
    
    if (this.cdr && typeof this.cdr.markForCheck === 'function') {
      this.cdr.markForCheck();
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      codigo_producto: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', Validators.maxLength(500)],
      categoria_id: ['', [Validators.required]],
      precio_costo: [0, [Validators.required, Validators.min(0.01)]],
      precio_venta: [0, [Validators.required, Validators.min(0.01)]],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      estado: ['ACTIVO', Validators.required]
    });
  }

  private resetForm(): void {
    this.form.reset({
      codigo_producto: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      precio_costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      estado: 'ACTIVO'
    });
    this.errorMessage = '';
    this.isEditMode = false;
    this.productoId = null;
  }

  private cargarCategorias(): void {
    this.categoriasLoading = true;
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categoriasLoading = false;
        if (this.cdr?.markForCheck) this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.categoriasLoading = false;
        if (this.cdr?.markForCheck) this.cdr.markForCheck();
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('minLength')) return `Mínimo ${field.errors?.['minLength'].requiredLength} caracteres`;
    if (field?.hasError('min')) return 'El valor debe ser mayor a 0';
    if (field?.hasError('maxLength')) return 'Máximo 500 caracteres';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      if (this.cdr?.markForCheck) this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const formData = this.form.value;

    if (this.cdr?.markForCheck) this.cdr.markForCheck();

    if (this.isEditMode && this.productoId) {
      // ACTUALIZAR producto
      this.productosService.actualizarProducto(this.productoId, formData).subscribe({
        next: (result: any) => {
          this.loading = false;
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
          this.saved.emit(result);
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error al actualizar producto:', err);
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.Error || 'Error al actualizar el producto';
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
        }
      });
    } else {
      // CREAR producto
      this.productosService.crearProducto(formData).subscribe({
        next: (result: any) => {
          this.loading = false;
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
          this.saved.emit(result);
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error al crear producto:', err);
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.Error || 'Error al crear el producto';
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
        }
      });
    }
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm();
  }
}
