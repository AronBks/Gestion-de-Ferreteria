import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { Usuario } from '../../usuarios/usuario.entity';

// ============================================================================
// ENUMS — Estados fiscales y canales de envío
// ============================================================================

export enum EstadoSiat {
  PENDIENTE = 'PENDIENTE',
  EMITIDA = 'EMITIDA',
  ANULADA = 'ANULADA',
  RECHAZADA = 'RECHAZADA',
  OBSERVADA = 'OBSERVADA',
}

export enum CanalEnvio {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  NINGUNO = 'NINGUNO',
}

// ============================================================================
// ENTIDAD: Factura Electrónica (SIAT Bolivia)
// ============================================================================

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ---- Relación 1:1 con Venta ----

  @Column({ name: 'venta_id', type: 'uuid', unique: true })
  ventaId: string;

  @OneToOne(() => Venta, (venta) => venta.factura, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  // ---- Datos Fiscales SIAT ----

  @Column({ length: 150, nullable: true })
  cuf: string;

  @Column({ length: 150, nullable: true })
  cufd: string;

  @Column({ name: 'numero_factura', type: 'bigint' })
  numeroFactura: number;

  @Column({ name: 'fecha_emision', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaEmision: Date;

  @Column({ name: 'codigo_control', length: 50, nullable: true })
  codigoControl: string;

  @Column({ name: 'numero_autorizacion', length: 100, nullable: true })
  numeroAutorizacion: string;

  // ---- Leyenda SIAT ----

  @Column({ name: 'leyenda_siat', type: 'text', nullable: true })
  leyendaSiat: string;

  // ---- Estado Fiscal ----

  @Column({
    name: 'estado_siat',
    type: 'enum',
    enum: EstadoSiat,
    default: EstadoSiat.PENDIENTE,
  })
  estadoSiat: EstadoSiat;

  @Column({ name: 'motivo_anulacion', type: 'text', nullable: true })
  motivoAnulacion: string;

  @Column({ name: 'fecha_anulacion', type: 'timestamptz', nullable: true })
  fechaAnulacion: Date;

  // ---- Datos Empresa / Sucursal ----

  @Column({ name: 'actividad_economica', length: 20, default: '477310' })
  actividadEconomica: string;

  @Column({ name: 'punto_venta', type: 'int', default: 0 })
  puntoVenta: number;

  @Column({ type: 'int', default: 0 })
  sucursal: number;

  // ---- Documentos Generados ----

  @Column({ name: 'xml_content', type: 'text', nullable: true })
  xmlContent: string;

  @Column({ name: 'pdf_url', length: 500, nullable: true })
  pdfUrl: string;

  // ---- Control de Envío al Cliente ----

  @Column({ name: 'enviada_cliente', default: false })
  enviadaCliente: boolean;

  @Column({
    name: 'canal_envio',
    type: 'enum',
    enum: CanalEnvio,
    default: CanalEnvio.NINGUNO,
  })
  canalEnvio: CanalEnvio;

  @Column({ name: 'fecha_envio', type: 'timestamptz', nullable: true })
  fechaEnvio: Date;

  @Column({ name: 'destino_envio', length: 255, nullable: true })
  destinoEnvio: string;

  // ---- Auditoría ----

  @Column({ name: 'creado_por', nullable: true })
  creadoPor: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por' })
  creadoPorUsuario: Usuario;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion: Date;
}
