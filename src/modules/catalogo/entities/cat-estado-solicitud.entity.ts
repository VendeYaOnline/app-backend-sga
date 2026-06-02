import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sga.CAT_ESTADO_SOLICITUD')
export class CatEstadoSolicitud {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_estado', type: 'nvarchar', length: 200 })
  descripcionEstado: string;

  @Column({ name: 'orden', type: 'int', default: 1 })
  orden: number;

  @Column({ name: 'es_estado_final', type: 'bit', default: 0 })
  esEstadoFinal: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;
}
