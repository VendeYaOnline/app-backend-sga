import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Entity('sga.PJUD_LLAMADA')
export class PjudLlamada {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'endpoint', type: 'nvarchar', length: 50 })
  endpoint: string;

  @Column({ name: 'direccion', type: 'nvarchar', length: 10 })
  direccion: string;

  @Column({ name: 'crr_id_solicitud', type: 'bigint', nullable: true })
  crrIdSolicitud: number | null;

  @Column({ name: 'solicitud_id', type: 'int', nullable: true })
  solicitudId: number | null;

  @Column({ name: 'folio_interno', type: 'bigint', nullable: true })
  folioInterno: number | null;

  @Column({ name: 'request_body', type: 'nvarchar', length: 'max', nullable: true })
  requestBody: string | null;

  @Column({ name: 'response_body', type: 'nvarchar', length: 'max', nullable: true })
  responseBody: string | null;

  @Column({ name: 'http_status', type: 'int', nullable: true })
  httpStatus: number | null;

  @Column({ name: 'recepcion_status', type: 'int', nullable: true })
  recepcionStatus: number | null;

  @Column({ name: 'mensaje_respuesta', type: 'nvarchar', length: 'max', nullable: true })
  mensajeRespuesta: string | null;

  @Column({ name: 'fecha_llamada', type: 'datetime2' })
  fechaLlamada: Date;

  @Column({ name: 'duracion_ms', type: 'int', nullable: true })
  duracionMs: number | null;

  @Column({ name: 'error_desc', type: 'nvarchar', length: 'max', nullable: true })
  errorDesc: string | null;

  @Column({ name: 'procesado_ok', type: 'bit', default: 0 })
  procesadoOk: boolean;

  @Column({ name: 'procesado_at', type: 'datetime2', nullable: true })
  procesadoAt: Date | null;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;
}
