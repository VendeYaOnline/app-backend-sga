import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CatTipoEvento } from '../../catalogo/entities/cat-tipo-evento.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.EVENTO')
export class Evento {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'tipo_evento_id', type: 'int' })
  tipoEventoId: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'evento_padre_id', type: 'int', nullable: true })
  eventoPadreId: number | null;

  @Column({
    name: 'estado_evento',
    type: 'nvarchar',
    length: 30,
    default: 'PENDIENTE',
  })
  estadoEvento: string;

  @Column({ name: 'origen_creacion', type: 'nvarchar', length: 30 })
  origenCreacion: string;

  @Column({ name: 'fecha_evento', type: 'datetime2' })
  fechaEvento: Date;

  @Column({ name: 'asignado_a', type: 'int', nullable: true })
  asignadoA: number | null;

  @Column({
    name: 'observaciones',
    type: 'nvarchar',
    length: 'max',
    nullable: true,
  })
  observaciones: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @ManyToOne(() => CatTipoEvento)
  @JoinColumn({ name: 'tipo_evento_id', referencedColumnName: 'id' })
  tipoEvento: CatTipoEvento;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a', referencedColumnName: 'id' })
  asignado: Usuario;

  @ManyToOne(() => Evento, { nullable: true })
  @JoinColumn({ name: 'evento_padre_id', referencedColumnName: 'id' })
  eventoPadre: Evento | null;

  @OneToMany(() => Evento, (e) => e.eventoPadre)
  eventosHijos: Evento[];
}
