import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Entity('sga.ACCION_USUARIO')
export class AccionUsuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @Column({ name: 'tipo_accion', type: 'nvarchar', length: 60 })
  tipoAccion: string;

  @Column({ name: 'entidad', type: 'nvarchar', length: 50 })
  entidad: string;

  @Column({ name: 'entidad_id', type: 'int' })
  entidadId: number;

  @Column({ name: 'solicitud_id', type: 'int', nullable: true })
  solicitudId: number | null;

  @Column({ name: 'fecha_accion', type: 'datetime2' })
  fechaAccion: Date;

  @Column({ name: 'detalles', type: 'nvarchar', length: 'max', nullable: true })
  detalles: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;
}
