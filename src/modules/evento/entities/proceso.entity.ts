import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatRegion } from '../../catalogo/entities/cat-region.entity';
import { CatComuna } from '../../catalogo/entities/cat-comuna.entity';
import { CatMotivoNoRealizado } from '../../catalogo/entities/cat-motivo-no-realizado.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.PROCESO')
export class Proceso {
  @PrimaryColumn({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'numero_intento', type: 'int', default: 1 })
  numeroIntento: number;

  @Column({ name: 'agendamiento_id', type: 'int', nullable: true })
  agendamientoId: number | null;

  @Column({ name: 'tecnico_id', type: 'int', nullable: true })
  tecnicoId: number | null;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({ name: 'region_id', type: 'int', nullable: true })
  regionId: number | null;

  @Column({ name: 'comuna_id', type: 'int', nullable: true })
  comunaId: number | null;

  @Column({
    name: 'direccion_proceso',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  direccionProceso: string | null;

  @Column({ name: 'fecha_programada', type: 'datetime2', nullable: true })
  fechaProgramada: Date | null;

  @Column({ name: 'fecha_ejecucion', type: 'datetime2', nullable: true })
  fechaEjecucion: Date | null;

  @Column({ name: 'hora_llegada', type: 'time', nullable: true })
  horaLlegada: string | null;

  @Column({ name: 'hora_salida', type: 'time', nullable: true })
  horaSalida: string | null;

  @Column({ name: 'realizado', type: 'bit', nullable: true })
  realizado: boolean | null;

  @Column({ name: 'motivo_no_realizado_id', type: 'int', nullable: true })
  motivoNoRealizadoId: number | null;

  @Column({
    name: 'detalle_no_realizado',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  detalleNoRealizado: string | null;

  @Column({ name: 'fecha_cierre', type: 'datetime2', nullable: true })
  fechaCierre: Date | null;

  @Column({ name: 'cerrado_by', type: 'int', nullable: true })
  cerradoBy: number | null;

  @Column({ name: 'condenado_id', type: 'int', nullable: true })
  condenadoId: number | null;

  @Column({ name: 'victima_id', type: 'int', nullable: true })
  victimaId: number | null;

  @Column({ name: 'notas', type: 'nvarchar', length: 'max', nullable: true })
  notas: string | null;

  @Column({
    name: 'para_quien',
    type: 'nvarchar',
    length: 10,
    default: 'CONDENADO',
  })
  paraQuien: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'tecnico_id', referencedColumnName: 'id' })
  tecnico: Usuario;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;

  @ManyToOne(() => CatComuna)
  @JoinColumn({ name: 'comuna_id', referencedColumnName: 'id' })
  comuna: CatComuna;

  @ManyToOne(() => CatMotivoNoRealizado)
  @JoinColumn({ name: 'motivo_no_realizado_id', referencedColumnName: 'id' })
  motivoNoRealizado: CatMotivoNoRealizado;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cerrado_by', referencedColumnName: 'id' })
  cerradoPor: Usuario;

  @ManyToOne(() => Agendamiento)
  @JoinColumn({ name: 'agendamiento_id', referencedColumnName: 'id' })
  agendamiento: Agendamiento;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima;
}
