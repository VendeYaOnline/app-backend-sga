import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { Proceso } from '../../evento/entities/proceso.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatRegion } from '../../catalogo/entities/cat-region.entity';
import { CatComuna } from '../../catalogo/entities/cat-comuna.entity';
import { CatTipoLugar } from '../../catalogo/entities/cat-tipo-lugar.entity';
import { CatMotivoNoRealizado } from '../../catalogo/entities/cat-motivo-no-realizado.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.AGENDAMIENTO')
export class Agendamiento {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'crs_id', type: 'int' })
  crsId: number;

  @Column({
    name: 'para_quien',
    type: 'nvarchar',
    length: 10,
    default: 'CONDENADO',
  })
  paraQuien: string;

  @Column({ name: 'condenado_id', type: 'int', nullable: true })
  condenadoId: number | null;

  @Column({ name: 'victima_id', type: 'int', nullable: true })
  victimaId: number | null;

  @Column({ name: 'asignado_a', type: 'int', nullable: true })
  asignadoA: number | null;

  @Column({ name: 'tomado_at', type: 'datetime2', nullable: true })
  tomadoAt: Date | null;

  @Column({ name: 'fecha_agendada', type: 'datetime2' })
  fechaAgendada: Date;

  @Column({ name: 'hora_inicio_rango', type: 'time', nullable: true })
  horaInicioRango: string | null;

  @Column({ name: 'hora_fin_rango', type: 'time', nullable: true })
  horaFinRango: string | null;

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
    name: 'url_acceso',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  urlAcceso: string | null;

  @Column({
    name: 'tipo_soporte',
    type: 'nvarchar',
    length: 20,
    nullable: true,
  })
  tipoSoporte: string | null;

  @Column({ name: 'es_vigente', type: 'bit', default: 1 })
  esVigente: boolean;

  @Column({
    name: 'estado_agenda',
    type: 'nvarchar',
    length: 20,
    default: 'EN_PROCESO',
  })
  estadoAgenda: string;

  @Column({ name: 'numero_intento', type: 'int', default: 1 })
  numeroIntento: number;

  @Column({ name: 'motivo_no_realizado_id', type: 'int', nullable: true })
  motivoNoRealizadoId: number | null;

  @Column({
    name: 'detalle_no_realizado',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  detalleNoRealizado: string | null;

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

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'asignado_a', referencedColumnName: 'id' })
  asignado: Usuario;

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;

  @ManyToOne(() => CatComuna)
  @JoinColumn({ name: 'comuna_id', referencedColumnName: 'id' })
  comuna: CatComuna;

  @ManyToOne(() => CatTipoLugar)
  @JoinColumn({ name: 'tipo_lugar_id', referencedColumnName: 'id' })
  tipoLugar: CatTipoLugar;

  @ManyToOne(() => CatMotivoNoRealizado)
  @JoinColumn({ name: 'motivo_no_realizado_id', referencedColumnName: 'id' })
  motivoNoRealizado: CatMotivoNoRealizado;

  @OneToOne(() => Proceso, (p) => p.agendamiento)
  proceso: Proceso;
}
