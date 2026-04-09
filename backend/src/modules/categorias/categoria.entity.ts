import { Entity, PrimaryColumn, Column, Generated } from 'typeorm';

@Entity('categorias')
export class Categoria {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'imagen_url', type: 'varchar', length: 500, nullable: true })
  imagen_url: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO', 'DESCONTINUADO'],
    default: 'ACTIVO',
  })
  estado: string;

  @Column({ name: 'orden_visualizacion', type: 'integer', default: 0 })
  orden_visualizacion: number;

  @Column({ name: 'fecha_creacion', type: 'timestamp' })
  fecha_creacion: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp' })
  fecha_actualizacion: Date;

  @Column({ name: 'creado_por', type: 'uuid' })
  creado_por: string;
}
