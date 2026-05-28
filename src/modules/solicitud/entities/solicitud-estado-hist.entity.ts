import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.SOLICITUD_ESTADO_HIST')
export class SolicitudEstadoHist {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'estado_nuevo', type: 'nvarchar', length: 50 })
  estadoNuevo: string;

  @Column({ name: 'estado_anterior', type: 'nvarchar', length: 50, nullable: true })
  estadoAnterior: string | null;

  @Column({ name: 'fecha_cambio', type: 'datetime2' })
  fechaCambio: Date;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @Column({ name: 'motivo_cambio', type: 'nvarchar', length: 500, nullable: true })
  motivoCambio: string | null;

  @Column({ name: 'evento_id', type: 'int', nullable: true })
  eventoId: number | null;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;
}
