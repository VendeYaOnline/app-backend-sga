import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PrefactPeriodo } from './prefact-periodo.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.PREFACT_DETALLE')
export class PrefactDetalle {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'periodo_id', type: 'int' })
  periodoId: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'tipo_sujeto', type: 'nvarchar', length: 10 })
  tipoSujeto: string;

  @Column({ name: 'condenado_id', type: 'int', nullable: true })
  condenadoId: number | null;

  @Column({ name: 'victima_id', type: 'int', nullable: true })
  victimaId: number | null;

  @Column({ name: 'dias_monitoreados', type: 'int', default: 0 })
  diasMonitoreados: number;

  @Column({ name: 'fecha_inicio_periodo', type: 'date', nullable: true })
  fechaInicioPeriodo: string | null;

  @Column({ name: 'fecha_fin_periodo', type: 'date', nullable: true })
  fechaFinPeriodo: string | null;

  @Column({ name: 'notas', type: 'nvarchar', length: 500, nullable: true })
  notas: string | null;

  @ManyToOne(() => PrefactPeriodo)
  @JoinColumn({ name: 'periodo_id', referencedColumnName: 'id' })
  periodo: PrefactPeriodo;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima;
}
