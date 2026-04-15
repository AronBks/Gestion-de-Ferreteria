import { Categoria } from './categoria.model';

export interface Producto {
  id: string;
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  categoria_id: string;
  categoria?: Categoria; // ✅ Nueva propiedad para la categoría
  precio_costo: number;
  precio_venta: number;
  margen_ganancia?: number;
  stock_actual: number;
  stock_minimo?: number;
  stock_maximo?: number;
  estado: string;
}

export interface ProductosResponse {
  data: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
