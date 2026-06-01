import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CatEstadoSolicitud } from './cat-estado-solicitud.entity';
import { CatRol } from '../../auth/entities/cat-rol.entity';

@Entity('sga.CAT_ESTADO_SOLICITUD_TRANSICION')
@Unique(['estadoOrigenId', 'estadoDestinoId', 'rolId'])
export class CatEstadoSolicitudTransicion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'estado_origen_id', type: 'int' })
  estadoOrigenId: number;

  @Column({ name: 'estado_destino_id', type: 'int' })
  estadoDestinoId: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @ManyToOne(() => CatEstadoSolicitud)
  @JoinColumn({ name: 'estado_origen_id', referencedColumnName: 'id' })
  estadoOrigen: CatEstadoSolicitud;

  @ManyToOne(() => CatEstadoSolicitud)
  @JoinColumn({ name: 'estado_destino_id', referencedColumnName: 'id' })
  estadoDestino: CatEstadoSolicitud;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;
}
