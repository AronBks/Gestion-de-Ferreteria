import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  codigo_producto: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'categoria_id', type: 'uuid', nullable: true })
  categoria_id: string;

  @Column({ name: 'precio_costo', type: 'numeric', precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  precio_costo: number;

  @Column({ name: 'precio_venta', type: 'numeric', precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  precio_venta: number;

  @Column({ name: 'margen_ganancia', type: 'numeric', precision: 5, scale: 2, nullable: true, transformer: { to: (v) => v, from: (v) => (v ? parseFloat(v) : null) } })
  margen_ganancia: number;

  @Column({ name: 'unidad_medida', type: 'varchar', length: 50, nullable: true })
  unidad_medida: string;

  @Column({ name: 'stock_actual', type: 'integer', default: 0 })
  stock_actual: number;

  @Column({ name: 'stock_minimo', type: 'integer', nullable: true })
  stock_minimo: number;

  @Column({ name: 'stock_maximo', type: 'integer', nullable: true })
  stock_maximo: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  codigo_barras: string;

  @Column({ name: 'imagen_url', type: 'varchar', length: 500, nullable: true })
  imagen_url: string;

  @Column({ name: 'creado_por', type: 'uuid', nullable: true })
  creado_por: string;

  @Column({ type: 'varchar', nullable: true })
  estado: string;

  @Column({ type: 'boolean', default: false })
  es_compuesto: boolean;
}
