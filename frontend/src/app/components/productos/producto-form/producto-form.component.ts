import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../../models/producto.model';
import { ProductosService } from '../../../services/productos.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Inicializar el formulario en blanco
    this.resetForm();
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
    
    // Guard para evitar error si cdr no está inicializado
    if (this.cdr && typeof this.cdr.markForCheck === 'function') {
      this.cdr.markForCheck();
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      codigo_producto: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', Validators.maxLength(500)],
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
      precio_costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      estado: 'ACTIVO'
    });
    this.errorMessage = '';
    this.isEditMode = false;
    this.productoId = null;
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
      console.log('❌ Formulario inválido:', this.form.errors);
      if (this.cdr?.markForCheck) this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const formData = this.form.value;

    console.log('\n=== GUARDANDO PRODUCTO ===');
    console.log('Modo:', this.isEditMode ? 'EDITAR' : 'CREAR');
    console.log('Producto ID:', this.productoId);
    console.log('Datos:', formData);
    if (this.cdr?.markForCheck) this.cdr.markForCheck();

    if (this.isEditMode && this.productoId) {
      // ACTUALIZAR producto
      this.productosService.actualizarProducto(this.productoId, formData).subscribe({
        next: (result: any) => {
          console.log('✅ Producto actualizado:', result);
          this.loading = false;
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
          this.saved.emit(result);
          this.closeModal();
        },
        error: (err: any) => {
          console.error('❌ Error al actualizar:', err);
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.Error || 'Error al actualizar el producto';
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
        }
      });
    } else {
      // CREAR producto
      this.productosService.crearProducto(formData).subscribe({
        next: (result: any) => {
          console.log('✅ Producto creado:', result);
          this.loading = false;
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
          this.saved.emit(result);
          this.closeModal();
        },
        error: (err: any) => {
          console.error('❌ Error al crear:', err);
          this.loading = false;
          this.errorMessage = err.error?.message || err.error?.Error || 'Error al crear el producto';
          if (this.cdr?.markForCheck) this.cdr.markForCheck();
        }
      });
    }
  }

  closeModal(): void {
    console.log('ProductoFormComponent: closeModal()');
    this.resetForm();
    this.close.emit();
  }
}
