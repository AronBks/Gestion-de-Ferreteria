import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'GERENTE', 'VENDEDOR', 'ALMACENERO'],
  })
  rol: string;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}
