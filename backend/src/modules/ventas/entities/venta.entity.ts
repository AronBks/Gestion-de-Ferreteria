import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/usuario.entity';

export enum PaymentMethod {
  EFECTIVO = 'EFECTIVO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE'
}

export enum SaleStatus {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  DEVUELTA = 'DEVUELTA'
}

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_venta', unique: true, length: 20 })
  numeroVenta: string;

  @Column({ name: 'numero_comprobante', length: 50, nullable: true })
  numeroComprobante: string;

  @Column({ name: 'tipo_comprobante', length: 20, default: 'FACTURA' })
  tipoComprobante: string;

  @Column({ name: 'cliente_nombre', length: 255, nullable: true })
  clienteNombre: string;

  @Column({ name: 'cliente_documento', length: 20, nullable: true })
  clienteDocumento: string;

  @CreateDateColumn({ name: 'fecha_venta' })
  fechaVenta: Date;

  @Column({ name: 'vendedor_id' })
  vendedorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Usuario;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  igv: number;

  @Column('decimal', { name: 'descuento_total', precision: 12, scale: 2, default: 0 })
  descuentoTotal: number;

  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @Column('decimal', { name: 'monto_pagado', precision: 12, scale: 2 })
  montoPagado: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  vuelto: number;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'metodo_pago', default: PaymentMethod.EFECTIVO })
  metodoPago: PaymentMethod;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.COMPLETADA })
  estado: SaleStatus;

  @Column({ name: 'numero_referencia', length: 100, nullable: true })
  numeroReferencia: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'es_devolucion', default: false })
  esDevolucion: boolean;

  @Column({ name: 'venta_originalid', nullable: true })
  ventaOriginalId: string;

  @Column({ name: 'creado_por', nullable: true })
  creadoPor: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
