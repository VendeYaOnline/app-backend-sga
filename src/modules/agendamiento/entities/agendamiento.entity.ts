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
import { CatRegion } from '../../catalogo/entities/cat-region.entity';
import { CatComuna } from '../../catalogo/entities/cat-comuna.entity';
import { CatTipoLugar } from '../../catalogo/entities/cat-tipo-lugar.entity';

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

  @Column({ name: 'region_id', type: 'int', nullable: true })
  regionId: number | null;

  @Column({ name: 'comuna_id', type: 'int', nullable: true })
  comunaId: number | null;

  @Column({ name: 'tipo_lugar_id', type: 'int', nullable: true })
  tipoLugarId: number | null;

  @Column({
    name: 'direccion_agenda',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  direccionAgenda: string | null;

  @Column({
    name: 'estado_agenda',
    type: 'nvarchar',
    length: 20,
    default: 'EN_PROCESO',
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

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a', referencedColumnName: 'id' })
  asignado: Usuario;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;

  @ManyToOne(() => CatComuna)
  @JoinColumn({ name: 'comuna_id', referencedColumnName: 'id' })
  comuna: CatComuna;

  @ManyToOne(() => CatTipoLugar)
  @JoinColumn({ name: 'tipo_lugar_id', referencedColumnName: 'id' })
  tipoLugar: CatTipoLugar;
}
