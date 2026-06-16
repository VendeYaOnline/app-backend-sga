import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Archivo } from './archivo.entity';
import { CatPropositoArchivo } from '../../catalogo/entities/cat-proposito-archivo.entity';

@Entity('sga.ARCHIVO_REFERENCIA')
export class ArchivoReferencia {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'archivo_id', type: 'int' })
  archivoId: number;

  @Column({ name: 'entidad', type: 'nvarchar', length: 50 })
  entidad: string;

  @Column({ name: 'entidad_id', type: 'int' })
  entidadId: number;

  @Column({ name: 'proposito_id', type: 'int' })
  propositoId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @ManyToOne(() => Archivo)
  @JoinColumn({ name: 'archivo_id', referencedColumnName: 'id' })
  archivo: Archivo;

  @ManyToOne(() => CatPropositoArchivo)
  @JoinColumn({ name: 'proposito_id', referencedColumnName: 'id' })
  proposito: CatPropositoArchivo;
}
