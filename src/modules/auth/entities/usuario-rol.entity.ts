import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { CatRol } from './cat-rol.entity';

@Entity('sga.USUARIO_ROL')
export class UsuarioRol {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @CreateDateColumn({ name: 'asignado_at', type: 'datetime2' })
  asignadoAt: Date;

  @Column({ name: 'asignado_by', type: 'int', nullable: true })
  asignadoBy: number | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_by', referencedColumnName: 'id' })
  asignadoPor: Usuario;
}
