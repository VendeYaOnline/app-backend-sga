import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';

@Entity('sga.SOLICITUD_SOLICITANTE')
export class SolicitudSolicitante {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'rol_solicitante', type: 'nvarchar', length: 30 })
  rolSolicitante: string;

  @Column({ name: 'nombres', type: 'nvarchar', length: 100 })
  nombres: string;

  @Column({ name: 'apellido_paterno', type: 'nvarchar', length: 100 })
  apellidoPaterno: string;

  @Column({
    name: 'apellido_materno',
    type: 'nvarchar',
    length: 100,
    nullable: true,
  })
  apellidoMaterno: string | null;

  @Column({
    name: 'rut_solicitante',
    type: 'nvarchar',
    length: 20,
    nullable: true,
  })
  rutSolicitante: string | null;

  @Column({
    name: 'email_solicitante',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  emailSolicitante: string | null;

  @Column({ name: 'telefono', type: 'nvarchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ name: 'es_principal', type: 'bit', default: 0 })
  esPrincipal: boolean;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;
}
