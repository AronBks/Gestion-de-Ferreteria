import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from '../../productos/producto.entity';

@Entity('detalle_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venta_id' })
  ventaId: string;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ name: 'producto_id' })
  productoId: string;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column('int')
  cantidad: number;

  @Column('decimal', { name: 'precio_unitario', precision: 12, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { name: 'descuento_item', precision: 12, scale: 2, default: 0 })
  descuentoItem: number;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}