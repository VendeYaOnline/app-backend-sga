import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.NOTIFICACION_USUARIO')
export class NotificacionUsuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'notificacion_id', type: 'int' })
  notificacionId: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @Column({ name: 'enviado_app_at', type: 'datetime2', nullable: true })
  enviadoAppAt: Date | null;

  @Column({ name: 'leida_at', type: 'datetime2', nullable: true })
  leidaAt: Date | null;

  @Column({ name: 'enviado_correo_at', type: 'datetime2', nullable: true })
  enviadoCorreoAt: Date | null;

  @Column({ name: 'correo_exitoso', type: 'bit', nullable: true })
  correoExitoso: boolean | null;

  @ManyToOne(() => Notificacion)
  @JoinColumn({ name: 'notificacion_id', referencedColumnName: 'id' })
  notificacion: Notificacion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;
}
