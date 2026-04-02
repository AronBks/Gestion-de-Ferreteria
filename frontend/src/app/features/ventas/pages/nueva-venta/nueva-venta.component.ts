import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VentasService } from '../../services/ventas.service';
import { ProductosService } from '../../../../services/productos.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreateVentaPayload, PaymentMethod } from '../../models/venta.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface CartItem {
  productoId: string;
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
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 p-4">
      
      <!-- LADO IZQUIERDO: Búsqueda y Carrito (60%) -->
      <div class="w-full md:w-3/5 flex flex-col bg-surface border border-border rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        
        <!-- Searcher -->
        <div class="p-4 border-b border-border dark:border-gray-700 relative">
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              id="search-input"
              type="text" 
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar producto por nombre, código o escáner [F2]"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-amber-400 transition-all font-medium text-lg"
              autocomplete="off"
            >
            @if (buscando()) {
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <span class="material-icons animate-spin text-gray-400">refresh</span>
              </div>
            }
          </div>

          <!-- Dropdown Results -->
          @if (resultados().length > 0 && searchTerm().length > 0) {
            <div class="absolute w-[calc(100%-2rem)] mt-2 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto left-4 select-none">
              @for (prod of resultados(); track prod.id) {
                <div 
                  (click)="agregarAlCarrito(prod)"
                  class="flex justify-between items-center p-3 hover:bg-amber-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors"
                  [class.opacity-50]="prod.stockActual <= 0">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ prod.nombre }}</p>
                    <p class="text-xs text-gray-500 font-mono">{{ prod.codigoProducto }} | Stock: {{ prod.stockActual }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-green-600 dark:text-green-400">Bs. {{ prod.precioVenta | number:'1.2-2' }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Cart Table -->
        <div class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4">
          @if (carrito().length === 0) {
            <div class="h-full flex items-center justify-center">
              <app-empty-state 
                icon="shopping_cart" 
                title="Carrito vacío" 
                description="Busca un producto o escanea un código de barras para comenzar la venta."
              ></app-empty-state>
            </div>
          } @else {
            <div class="space-y-2">
              @for (item of carrito(); track item.productoId) {
                <div class="bg-white dark:bg-gray-800 p-3 flex flex-wrap sm:flex-nowrap items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in group">
                  
                  <div class="w-full sm:w-1/3 mb-2 sm:mb-0">
                    <p class="font-semibold text-gray-900 dark:text-white truncate" [title]="item.nombre">{{ item.nombre }}</p>
                    <p class="text-xs text-gray-500 font-mono">Bs. {{ item.precioUnitario | number:'1.2-2' }}</p>
                  </div>

                  <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow-sm hover:bg-gray-50" (click)="cambiarCantidad(item, -1)">-</button>
                    <input type="number" class="w-12 text-center bg-transparent border-none text-sm font-semibold p-0 focus:ring-0" [ngModel]="item.cantidad" (ngModelChange)="setCantidad(item, $event)">
                    <button class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow-sm hover:bg-gray-50" (click)="cambiarCantidad(item, 1)">+</button>
                  </div>

                  <div class="flex flex-col items-end min-w-[100px]">
                    <p class="font-bold text-lg text-gray-900 dark:text-white">
                      Bs. {{ ((item.precioUnitario * item.cantidad) - item.descuentoItem) | number:'1.2-2' }}
                    </p>
                  </div>

                  <button class="text-red-500 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity" (click)="quitarDelCarrito(item.productoId)" title="Quitar">
                    <span class="material-icons text-[20px]">delete</span>
                  </button>

                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- LADO DERECHO: Resumen y Pago (40%) -->
      <div class="w-full md:w-2/5 flex flex-col gap-4">
        
        <!-- Cliente -->
        <div class="bg-surface border border-border rounded-xl p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 class="font-heading font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <span class="material-icons text-amber-500">person</span> Datos del Cliente
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input type="text" [(ngModel)]="clienteNombre" class="w-full text-sm rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-1.5 focus:ring-amber-500" placeholder="Opcional">
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CI/NIT</label>
              <input type="text" [(ngModel)]="clienteDocumento" class="w-full text-sm rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-1.5 focus:ring-amber-500" placeholder="Opcional">
            </div>
          </div>
        </div>

        <!-- Resumen Financiero -->
        <div class="bg-surface border border-border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex-1 flex flex-col">
          <div class="space-y-3 flex-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-gray-900 dark:text-white">Bs. {{ subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-red-500">
              <span>Descuento Total</span>
              <span class="border-b border-dashed border-red-300 cursor-text" (click)="editarDescGlobal = !editarDescGlobal">
                @if (editarDescGlobal) {
                  <input type="number" [(ngModel)]="descuentoGlobal" class="w-20 text-right text-xs py-0.5 px-1 border border-red-400 rounded text-red-500 focus:ring-amber-500" placeholder="0.00" (blur)="editarDescGlobal = false">
                } @else {
                  - Bs. {{ descuentoGlobal() | number:'1.2-2' }}
                }
              </span>
            </div>
            <!-- Toggle input desc -->
            @if(editarDescGlobal) {
               <div class="flex justify-end"><input type="number" [ngModel]="descuentoGlobal()" (ngModelChange)="descuentoGlobal.set($event)" class="w-24 text-right py-1 px-2 text-sm rounded dark:bg-gray-700 border-gray-300 focus:ring-amber-500 text-red-500"></div>
            }

            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-xl font-bold font-heading text-gray-900 dark:text-white uppercase">Total</span>
              <span class="text-3xl font-black font-heading text-amber-500">Bs. {{ total() | number:'1.2-2' }}</span>
            </div>
          </div>
          
          <!-- Metodo Pago -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Método de Pago</label>
            <div class="grid grid-cols-2 gap-2 mb-4">
              <button (click)="setMetodoPago('EFECTIVO')" [ngClass]="btnMetodoClass('EFECTIVO')">
                <span class="material-icons text-sm mb-1">payments</span> Efectivo
              </button>
              <button (click)="setMetodoPago('TARJETA_DEBITO')" [ngClass]="btnMetodoClass('TARJETA_DEBITO')">
                <span class="material-icons text-sm mb-1">credit_card</span> Tarjeta
              </button>
              <button (click)="setMetodoPago('TRANSFERENCIA')" [ngClass]="btnMetodoClass('TRANSFERENCIA')">
                <span class="material-icons text-sm mb-1">account_balance</span> Transfer.
              </button>
              <button (click)="setMetodoPago('CHEQUE')" [ngClass]="btnMetodoClass('CHEQUE')">
                <span class="material-icons text-sm mb-1">request_quote</span> Cheque
              </button>
            </div>

            @if (metodoPago() === 'EFECTIVO') {
              <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium">Monto Recibido:</label>
                  <div class="flex items-center bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 px-2">
                    <span class="text-gray-500 text-sm">Bs.</span>
                    <input type="number" [ngModel]="montoPagado()" (ngModelChange)="montoPagado.set($event)" class="w-full bg-transparent border-none text-right font-bold focus:ring-0 py-1" />
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium">Vuelto:</label>
                  <span class="font-bold text-lg" [ngClass]="vuelto() >= 0 ? 'text-green-600' : 'text-red-500'">
                    Bs. {{ vuelto() | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            } @else {
              <input type="text" [(ngModel)]="numeroReferencia" placeholder="N° de Referencia / Autorización" class="w-full px-3 py-2 text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-amber-500 mb-2">
            }
          </div>

          <!-- Acciones -->
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button (click)="limpiarCarrito()" class="px-4 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30 font-medium transition-colors">
              Limpiar
            </button>
            <button 
              (click)="confirmarVenta()"
              [disabled]="carrito().length === 0 || processing() || (metodoPago() === 'EFECTIVO' && vuelto() < 0)"
              class="px-4 py-3 rounded-lg bg-amber-500 font-bold text-white shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              @if(processing()) {
                <span class="material-icons animate-spin">refresh</span>
              } @else {
                <span class="material-icons">check_circle</span> 
              }
              COBRAR
            </button>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
  `]
})
export class NuevaVentaComponent {
  private ventasService = inject(VentasService);
  private productosService = inject(ProductosService); // Asumiendo get() existe
  private toast = inject(ToastService);
  private router = inject(Router);

  // Estados tipo Signal para reactividad OnPush real-time
  carrito = signal<CartItem[]>([]);
  metodoPago = signal<PaymentMethod>('EFECTIVO');
  montoPagado = signal<number>(0);
  descuentoGlobal = signal<number>(0);
  searchTerm = signal<string>('');
  resultados = signal<any[]>([]);
  buscando = signal<boolean>(false);
  processing = signal<boolean>(false);

  // Inputs básicos
  clienteNombre = '';
  clienteDocumento = '';
  numeroReferencia = '';
  editarDescGlobal = false;

  private searchSubject = new Subject<string>();

  // Computados
  subtotal = computed(() => {
    return this.carrito().reduce((acc, item) => 
      acc + (item.precioUnitario * item.cantidad) - item.descuentoItem, 0
    );
  });

  total = computed(() => {
    return Math.max(0, this.subtotal() - this.descuentoGlobal());
  });

  vuelto = computed(() => {
    if (this.metodoPago() !== 'EFECTIVO') return 0;
    return this.montoPagado() - this.total();
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.ejecutarBusqueda(term);
    });

    // Auto update montoPagado igual al total cuando cambie el carrito en pago efectivo para agilizar
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
    // Buscar en todos los productos con paginación
    this.productosService.obtenerProductos(1, 100).subscribe({
      next: (res: any) => {
        const searchLower = term.toLowerCase();
        const filtered = (res.data || res).filter((p: any) => 
          (p.nombre && p.nombre.toLowerCase().includes(searchLower)) || 
          (p.codigoProducto && p.codigoProducto.toLowerCase().includes(searchLower)) ||
          (p.codigo && p.codigo.toLowerCase().includes(searchLower))
        );
        // Ordenar por stock disponible primero
        filtered.sort((a: any, b: any) => {
          const aStock = a.stockActual || a.stock_actual || 0;
          const bStock = b.stockActual || b.stock_actual || 0;
          return bStock - aStock;
        });
        this.resultados.set(filtered.slice(0, 15)); // Limitar a 15 resultados
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

    // Limpiar búsqueda
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

  quitarDelCarrito(id: string) {
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
    if (metodo === 'EFECTIVO') {
      this.montoPagado.set(this.total());
    } else {
      this.montoPagado.set(this.total());
    }
  }

  btnMetodoClass(metodo: PaymentMethod) {
    const isActivo = this.metodoPago() === metodo;
    return `flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all font-semibold text-xs ${
      isActivo 
        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' 
        : 'border-transparent bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    }`;
  }

  confirmarVenta() {
    if (this.carrito().length === 0) return;

    this.processing.set(true);

    const payload: CreateVentaPayload = {
      clienteNombre: this.clienteNombre || 'Cliente General',
      clienteDocumento: this.clienteDocumento,
      tipoComprobante: 'FACTURA',
      metodoPago: this.metodoPago(),
      montoPagado: this.montoPagado(),
      descuentoTotal: this.descuentoGlobal(),
      observaciones: this.numeroReferencia ? `Ref: ${this.numeroReferencia}` : '',
      items: this.carrito().map(i => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        descuentoItem: i.descuentoItem
      }))
    };

    this.ventasService.create(payload).subscribe({
      next: (res: any) => {
        this.toast.showSuccess(`Venta completada: ${res.numeroVenta}`);
        this.processing.set(false);
        // Aquí iría el Modal de Imprimir Recibo, para simplificar vamos al listado u originar nueva venta más rápido
        this.router.navigate(['/ventas']);
      },
      error: (err: any) => {
        this.processing.set(false);
      }
    });

  }
}