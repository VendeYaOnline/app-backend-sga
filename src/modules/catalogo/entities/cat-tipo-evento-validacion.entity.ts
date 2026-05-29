import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CatTipoEvento } from './cat-tipo-evento.entity';
import { CatRol } from '../../auth/entities/cat-rol.entity';

@Entity('sga.CAT_TIPO_EVENTO_VALIDACION')
export class CatTipoEventoValidacion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'tipo_evento_id', type: 'int' })
  tipoEventoId: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'orden', type: 'int', default: 1 })
  orden: number;

  @Column({ name: 'obligatorio', type: 'bit', default: 1 })
  obligatorio: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @ManyToOne(() => CatTipoEvento)
  @JoinColumn({ name: 'tipo_evento_id', referencedColumnName: 'id' })
  tipoEvento: CatTipoEvento;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;
}
