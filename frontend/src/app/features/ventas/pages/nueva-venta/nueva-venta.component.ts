import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VentasService } from '../../services/ventas.service';
import { ProductosService } from '../../../../services/productos.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreateVentaPayload, PaymentMethod } from '../../models/venta.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface CartItem {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  descuentoItem: number;
  stockActual: number;
  codigoBarra?: string;
  esCompuesto?: boolean;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.scss']
})
export class NuevaVentaComponent {
  private ventasService = inject(VentasService);
  private productosService = inject(ProductosService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  now = signal(new Date());

  fechaFormato = computed(() => {
    const fecha = this.now();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    const formateada = fecha.toLocaleDateString('es-ES', opciones);
    return formateada.charAt(0).toUpperCase() + formateada.slice(1);
  });

  carrito = signal<CartItem[]>([]);
  metodoPago = signal<PaymentMethod>('EFECTIVO');
  montoPagado = signal<number>(0);
  descuentoGlobal = signal<number>(0);
  searchTerm = signal<string>('');
  resultados = signal<any[]>([]);
  buscando = signal<boolean>(false);
  processing = signal<boolean>(false);

  clienteNombre = '';
  clienteDocumento = '';
  numeroReferencia = '';
  editarDescGlobal = false;

  private searchSubject = new Subject<string>();

  subtotal = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.precioUnitario * item.cantidad) - item.descuentoItem, 0);
  });

  total = computed(() => {
    return Math.max(0, this.subtotal() - this.descuentoGlobal());
  });

  vuelto = computed(() => {
    if (this.metodoPago() !== 'EFECTIVO') return 0;
    return this.montoPagado() - this.total();
  });

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(term => {
      this.ejecutarBusqueda(term);
    });

    effect(() => {
      const tot = this.total();
      if (this.metodoPago() === 'EFECTIVO' && this.montoPagado() < tot) {
        this.montoPagado.set(tot);
      }
    }, { allowSignalWrites: true });
  }

  onSearchChange(val: string) {
    this.searchTerm.set(val);
    this.searchSubject.next(val);
  }

  ejecutarBusqueda(term: string) {
    if (!term || term.trim() === '') {
      this.resultados.set([]);
      return;
    }
    this.buscando.set(true);
    this.productosService.obtenerProductos(1, 100).subscribe({
      next: (res: any) => {
        const searchLower = term.toLowerCase();
        const filtered = (res.data || res).filter((p: any) => 
          (p.nombre && p.nombre.toLowerCase().includes(searchLower)) || 
          (p.codigoProducto && p.codigoProducto.toLowerCase().includes(searchLower)) ||
          (p.codigo && p.codigo.toLowerCase().includes(searchLower))
        );
        filtered.sort((a: any, b: any) => {
          const aStock = a.stockActual || a.stock_actual || 0;
          const bStock = b.stockActual || b.stock_actual || 0;
          return bStock - aStock;
        });
        this.resultados.set(filtered.slice(0, 15));
        this.buscando.set(false);
      },
      error: () => {
        this.buscando.set(false);
        this.resultados.set([]);
      }
    });
  }

  agregarAlCarrito(prod: any) {
    if (prod.stockActual <= 0) {
      this.toast.showError(`Producto sin stock: ${prod.nombre}`);
      return;
    }

    this.carrito.update(items => {
      const existing = items.find(i => i.productoId === prod.id);
      if (existing) {
        if (existing.cantidad >= existing.stockActual) {
          this.toast.showWarning(`Stock máximo alcanzado para: ${prod.nombre}`);
          return items;
        }
        return items.map(i => i.productoId === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      
      const newItem: CartItem = {
        productoId: prod.id,
        nombre: prod.nombre,
        precioUnitario: prod.precioVenta,
        cantidad: 1,
        descuentoItem: 0,
        stockActual: prod.stockActual
      };
      
      this.toast.showSuccess(`${prod.nombre} agregado`);
      return [...items, newItem];
    });

    this.searchTerm.set('');
    this.resultados.set([]);
    document.getElementById('search-input')?.focus();
  }

  cambiarCantidad(item: CartItem, delta: number) {
    const nuevaCant = item.cantidad + delta;
    this.setCantidad(item, nuevaCant);
  }

  setCantidad(item: CartItem, cantidad: number) {
    if (cantidad <= 0) {
      this.quitarDelCarrito(item.productoId);
      return;
    }
    if (cantidad > item.stockActual) {
      this.toast.showWarning(`Stock insuficiente (Max: ${item.stockActual})`);
      cantidad = item.stockActual;
    }

    this.carrito.update(items => items.map(i => i.productoId === item.productoId ? { ...i, cantidad } : i));
  }

  quitarDelCarrito(id: number) {
    this.carrito.update(items => items.filter(i => i.productoId !== id));
  }

  limpiarCarrito() {
    if (confirm('¿Estás seguro de limpiar el carrito?')) {
      this.carrito.set([]);
      this.montoPagado.set(0);
      this.descuentoGlobal.set(0);
      this.clienteNombre = '';
      this.clienteDocumento = '';
    }
  }

  setMetodoPago(metodo: PaymentMethod) {
    this.metodoPago.set(metodo);
    this.montoPagado.set(this.total());
  }

  btnMetodoClass(metodo: PaymentMethod) {
    const isActivo = this.metodoPago() === metodo;
    return isActivo 
      ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-md' 
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-600';
  }

  confirmarVenta() {
    if (this.carrito().length === 0) {
      this.toast.showWarning('El carrito está vacío');
      return;
    }

    if (!this.metodoPago()) {
      this.toast.showWarning('Selecciona un método de pago');
      return;
    }

    if (this.montoPagado() < this.total()) {
      this.toast.showWarning('El monto pagado debe ser mayor o igual al total');
      return;
    }

    this.processing.set(true);

    const payload: CreateVentaPayload = {
      clienteNombre: this.clienteNombre?.trim() || 'Cliente General',
      clienteDocumento: this.clienteDocumento?.trim() || undefined,
      tipoComprobante: 'FACTURA',
      metodoPago: this.metodoPago(),
      montoPagado: this.montoPagado(),
      descuentoTotal: this.descuentoGlobal() > 0 ? this.descuentoGlobal() : undefined,
      observaciones: this.numeroReferencia?.trim() ? `Ref: ${this.numeroReferencia}` : undefined,
      items: this.carrito().map(i => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        descuentoItem: i.descuentoItem > 0 ? i.descuentoItem : undefined
      }))
    };

    this.ventasService.create(payload).subscribe({
      next: (res: any) => {
        this.toast.showSuccess(`✓ Venta completada: ${res.numeroVenta}`);
        this.processing.set(false);
        
        setTimeout(() => {
          this.carrito.set([]);
          this.montoPagado.set(0);
          this.descuentoGlobal.set(0);
          this.clienteNombre = '';
          this.clienteDocumento = '';
          this.numeroReferencia = '';
          this.metodoPago.set('EFECTIVO');
          this.router.navigate(['..'], { relativeTo: this.route });
        }, 1000);
      },
      error: (err: any) => {
        this.processing.set(false);
        const mensaje = err?.error?.message || err?.message || 'Error al crear la venta';
        this.toast.showError(`Error: ${mensaje}`);
      }
    });
  }
}
