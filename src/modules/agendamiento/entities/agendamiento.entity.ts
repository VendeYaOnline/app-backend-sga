import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.AGENDAMIENTO')
export class Agendamiento {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'fecha_agendada', type: 'datetime2' })
  fechaAgendada: Date;

  @Column({ name: 'hora_inicio_rango', type: 'time', nullable: true })
  horaInicioRango: string | null;

  @Column({ name: 'hora_fin_rango', type: 'time', nullable: true })
  horaFinRango: string | null;

  @Column({ name: 'asignado_a', type: 'int', nullable: true })
  asignadoA: number | null;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({
    name: 'direccion_agenda',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  direccionAgenda: string | null;

  @Column({ name: 'para_condenado', type: 'bit', default: 1 })
  paraCondenado: boolean;

  @Column({ name: 'para_victima_id', type: 'int', nullable: true })
  paraVictimaId: number | null;

  @Column({
    name: 'estado_agenda',
    type: 'nvarchar',
    length: 20,
    default: 'PROGRAMADO',
  })
  estadoAgenda: string;

  @Column({ name: 'notas', type: 'nvarchar', length: 500, nullable: true })
  notas: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a', referencedColumnName: 'id' })
  asignado: Usuario;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'para_victima_id', referencedColumnName: 'id' })
  paraVictima: Victima;
}
