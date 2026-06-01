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
import { CatTribunal } from '../../catalogo/entities/cat-tribunal.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatTipoLey } from '../../catalogo/entities/cat-tipo-ley.entity';
import { CatPenaSustitutiva } from '../../catalogo/entities/cat-pena-sustitutiva.entity';
import { CatMedidaControl } from '../../catalogo/entities/cat-medida-control.entity';
import { CatTipoDia } from '../../catalogo/entities/cat-tipo-dia.entity';
import { CatTipoHorario } from '../../catalogo/entities/cat-tipo-horario.entity';
import { CatTipoCausa } from '../../catalogo/entities/cat-tipo-causa.entity';
import { CatEstadoSolicitud } from '../../catalogo/entities/cat-estado-solicitud.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { SolicitudVictima } from './solicitud-victima.entity';

@Entity('sga.SOLICITUD')
export class Solicitud {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_padre_id', type: 'int', nullable: true })
  solicitudPadreId: number | null;

  @Column({
    name: 'motivo_origen',
    type: 'nvarchar',
    length: 30,
    default: 'ORIGINAL',
  })
  motivoOrigen: string;

  @Column({ name: 'origen_creacion', type: 'nvarchar', length: 30 })
  origenCreacion: string;

  @Column({ name: 'tipo_causa_id', type: 'int' })
  tipoCausaId: number;

  @Column({ name: 'ruc_causa', type: 'nvarchar', length: 50, nullable: true })
  rucCausa: string | null;

  @Column({ name: 'rit_causa', type: 'nvarchar', length: 50, nullable: true })
  ritCausa: string | null;

  @Column({ name: 'rol_causa', type: 'nvarchar', length: 50, nullable: true })
  rolCausa: string | null;

  @Column({ name: 'tribunal_id', type: 'int' })
  tribunalId: number;

  @Column({ name: 'condenado_id', type: 'int' })
  condenadoId: number;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({ name: 'tipo_ley_id', type: 'int', nullable: true })
  tipoLeyId: number | null;

  @Column({ name: 'tipo_pena_id', type: 'int', nullable: true })
  tipoPenaId: number | null;

  @Column({ name: 'medida_control_id', type: 'int', nullable: true })
  medidaControlId: number | null;

  @Column({ name: 'tipo_horario_id', type: 'int', nullable: true })
  tipoHorarioId: number | null;

  @Column({ name: 'hora_desde', type: 'time', nullable: true })
  horaDesde: string | null;

  @Column({ name: 'hora_hasta', type: 'time', nullable: true })
  horaHasta: string | null;

  @Column({ name: 'tipo_dia_inicio_id', type: 'int', nullable: true })
  tipoDiaInicioId: number | null;

  @Column({ name: 'tipo_dia_termino_id', type: 'int', nullable: true })
  tipoDiaTerminoId: number | null;

  @Column({ name: 'con_beacon', type: 'bit', default: 1 })
  conBeacon: boolean;

  @Column({ name: 'estado_actual_id', type: 'int' })
  estadoActualId: number;

  @Column({
    name: 'estado_at',
    type: 'datetime2',
    default: () => 'GETUTCDATE()',
  })
  estadoAt: Date;

  @Column({ name: 'asignada_a', type: 'int', nullable: true })
  asignadaA: number | null;

  @Column({ name: 'asignada_at', type: 'datetime2', nullable: true })
  asignadaAt: Date | null;

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

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_padre_id', referencedColumnName: 'id' })
  solicitudPadre: Solicitud;

  @ManyToOne(() => CatTipoCausa)
  @JoinColumn({ name: 'tipo_causa_id', referencedColumnName: 'id' })
  tipoCausa: CatTipoCausa;

  @ManyToOne(() => CatTribunal)
  @JoinColumn({ name: 'tribunal_id', referencedColumnName: 'id' })
  tribunal: CatTribunal;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatTipoLey)
  @JoinColumn({ name: 'tipo_ley_id', referencedColumnName: 'id' })
  tipoLey: CatTipoLey;

  @ManyToOne(() => CatPenaSustitutiva)
  @JoinColumn({ name: 'tipo_pena_id', referencedColumnName: 'id' })
  tipoPena: CatPenaSustitutiva;

  @ManyToOne(() => CatMedidaControl)
  @JoinColumn({ name: 'medida_control_id', referencedColumnName: 'id' })
  medidaControl: CatMedidaControl;

  @ManyToOne(() => CatTipoHorario)
  @JoinColumn({ name: 'tipo_horario_id', referencedColumnName: 'id' })
  tipoHorario: CatTipoHorario;

  @ManyToOne(() => CatTipoDia)
  @JoinColumn({ name: 'tipo_dia_inicio_id', referencedColumnName: 'id' })
  tipoDiaInicio: CatTipoDia;

  @ManyToOne(() => CatTipoDia)
  @JoinColumn({ name: 'tipo_dia_termino_id', referencedColumnName: 'id' })
  tipoDiaTermino: CatTipoDia;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignada_a', referencedColumnName: 'id' })
  asignado: Usuario;

  @ManyToOne(() => CatEstadoSolicitud)
  @JoinColumn({ name: 'estado_actual_id', referencedColumnName: 'id' })
  estadoActual: CatEstadoSolicitud;

  @OneToMany(() => SolicitudVictima, (sv) => sv.solicitud)
  solicitudVictimas: SolicitudVictima[];
}
