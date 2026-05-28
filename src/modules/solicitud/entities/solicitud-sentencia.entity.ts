import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { CatPenaSustitutiva } from '../../catalogo/entities/cat-pena-sustitutiva.entity';
import { CatMotivoNoFactible } from '../../catalogo/entities/cat-motivo-no-factible.entity';

@Entity('sga.SOLICITUD_SENTENCIA')
export class SolicitudSentencia {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

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

  @Column({ name: 'cumple_requisitos', type: 'bit', nullable: true })
  cumpleRequisitos: boolean | null;

  @Column({ name: 'motivo_no_cumple_id', type: 'int', nullable: true })
  motivoNoCumpleId: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => CatPenaSustitutiva)
  @JoinColumn({ name: 'tipo_pena_id', referencedColumnName: 'id' })
  tipoPena: CatPenaSustitutiva;

  @ManyToOne(() => CatMotivoNoFactible)
  @JoinColumn({ name: 'motivo_no_cumple_id', referencedColumnName: 'id' })
  motivoNoCumple: CatMotivoNoFactible;
}
