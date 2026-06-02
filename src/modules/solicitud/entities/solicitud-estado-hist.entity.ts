import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { CatEstadoSolicitud } from '../../catalogo/entities/cat-estado-solicitud.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Evento } from '../../evento/entities/evento.entity';

@Entity('sga.SOLICITUD_ESTADO_HIST')
export class SolicitudEstadoHist {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'estado_nuevo_id', type: 'int' })
  estadoNuevoId: number;

  @Column({
    name: 'estado_anterior_id',
    type: 'int',
    nullable: true,
  })
  estadoAnteriorId: number | null;

  @Column({ name: 'fecha_cambio', type: 'datetime2' })
  fechaCambio: Date;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @Column({
    name: 'motivo_cambio',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  motivoCambio: string | null;

  @Column({ name: 'evento_id', type: 'int', nullable: true })
  eventoId: number | null;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => CatEstadoSolicitud)
  @JoinColumn({ name: 'estado_nuevo_id', referencedColumnName: 'id' })
  estadoNuevo: CatEstadoSolicitud;

  @ManyToOne(() => CatEstadoSolicitud)
  @JoinColumn({ name: 'estado_anterior_id', referencedColumnName: 'id' })
  estadoAnterior: CatEstadoSolicitud;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;
}
