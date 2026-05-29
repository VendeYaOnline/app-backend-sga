import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificacionPlantilla } from './notificacion-plantilla.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Entity('sga.NOTIFICACION')
export class Notificacion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'plantilla_id', type: 'int' })
  plantillaId: number;

  @Column({ name: 'entidad', type: 'nvarchar', length: 50 })
  entidad: string;

  @Column({ name: 'entidad_id', type: 'int' })
  entidadId: number;

  @Column({ name: 'solicitud_id', type: 'int', nullable: true })
  solicitudId: number | null;

  @Column({ name: 'titulo', type: 'nvarchar', length: 200 })
  titulo: string;

  @Column({ name: 'mensaje', type: 'nvarchar', length: 'max' })
  mensaje: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @ManyToOne(() => NotificacionPlantilla)
  @JoinColumn({ name: 'plantilla_id', referencedColumnName: 'id' })
  plantilla: NotificacionPlantilla;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;
}
