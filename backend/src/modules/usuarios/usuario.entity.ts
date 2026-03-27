import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'contrasena_hash', type: 'varchar' })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'GERENTE', 'VENDEDOR', 'ALMACENERO'],
  })
  rol: string;
}
