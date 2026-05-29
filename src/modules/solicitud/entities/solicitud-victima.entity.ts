import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.SOLICITUD_VICTIMA')
export class SolicitudVictima {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'victima_id', type: 'int' })
  victimaId: number;

  @Column({ name: 'radio_prohibicion_metros', type: 'int', nullable: true })
  radioProhibicionMetros: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima;
}
