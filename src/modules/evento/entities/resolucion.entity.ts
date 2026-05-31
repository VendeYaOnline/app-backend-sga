import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';
import { CatTribunal } from '../../catalogo/entities/cat-tribunal.entity';
import { CatTipoLey } from '../../catalogo/entities/cat-tipo-ley.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatTipoCausa } from '../../catalogo/entities/cat-tipo-causa.entity';
import { CatPenaSustitutiva } from '../../catalogo/entities/cat-pena-sustitutiva.entity';

@Entity('sga.RESOLUCION')
export class Resolucion {
  @PrimaryColumn({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'tribunal_id', type: 'int', nullable: true })
  tribunalId: number | null;

  @Column({ name: 'tipo_causa_id', type: 'int', nullable: true })
  tipoCausaId: number | null;

  @Column({ name: 'ruc_res', type: 'nvarchar', length: 50, nullable: true })
  rucRes: string | null;

  @Column({ name: 'rit_res', type: 'nvarchar', length: 50, nullable: true })
  ritRes: string | null;

  @Column({ name: 'crr_id_pjud', type: 'nvarchar', length: 50, nullable: true })
  crrIdPjud: string | null;

  @Column({ name: 'tipo_ley_id', type: 'int', nullable: true })
  tipoLeyId: number | null;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({ name: 'num_pena', type: 'int', nullable: true })
  numPena: number | null;

  @Column({ name: 'tipo_pena_id', type: 'int', nullable: true })
  tipoPenaId: number | null;

  @Column({ name: 'fecha_dicto', type: 'date', nullable: true })
  fechaDicto: string | null;

  @Column({ name: 'fecha_recepcion_crs', type: 'date', nullable: true })
  fechaRecepcionCrs: string | null;

  @Column({ name: 'dias_condena', type: 'int', nullable: true })
  diasCondena: number | null;

  @Column({ name: 'dias_abono', type: 'int', default: 0 })
  diasAbono: number;

  @Column({ name: 'dias_monitoreo', type: 'int', nullable: true })
  diasMonitoreo: number | null;

  @Column({ name: 'ejecutoriada', type: 'bit', nullable: true })
  ejecutoriada: boolean | null;

  @Column({ name: 'plazo_monitoreo_dias', type: 'int', nullable: true })
  plazoMonitoreoDias: number | null;

  @Column({ name: 'fecha_inicio_monitoreo', type: 'date', nullable: true })
  fechaInicioMonitoreo: string | null;

  @Column({ name: 'fecha_termino_anterior', type: 'date', nullable: true })
  fechaTerminoAnterior: string | null;

  @Column({ name: 'fecha_termino_nueva', type: 'date', nullable: true })
  fechaTerminoNueva: string | null;

  @Column({ name: 'victima_consentimiento', type: 'bit', nullable: true })
  victimaConsentimiento: boolean | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTribunal)
  @JoinColumn({ name: 'tribunal_id', referencedColumnName: 'id' })
  tribunal: CatTribunal;

  @ManyToOne(() => CatTipoLey)
  @JoinColumn({ name: 'tipo_ley_id', referencedColumnName: 'id' })
  tipoLey: CatTipoLey;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatTipoCausa)
  @JoinColumn({ name: 'tipo_causa_id', referencedColumnName: 'id' })
  tipoCausa: CatTipoCausa | null;

  @ManyToOne(() => CatPenaSustitutiva)
  @JoinColumn({ name: 'tipo_pena_id', referencedColumnName: 'id' })
  tipoPena: CatPenaSustitutiva | null;
}
