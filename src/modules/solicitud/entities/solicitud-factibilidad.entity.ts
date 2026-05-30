import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { CatTipoFactibilidad } from '../../catalogo/entities/cat-tipo-factibilidad.entity';
import { CatMotivoNoFactible } from '../../catalogo/entities/cat-motivo-no-factible.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.SOLICITUD_FACTIBILIDAD')
export class SolicitudFactibilidad {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'tipo_factibilidad_id', type: 'int' })
  tipoFactibilidadId: number;

  @Column({ name: 'motivo_no_factible_id', type: 'int', nullable: true })
  motivoNoFactibleId: number | null;

  @Column({ name: 'folio_interno', type: 'bigint' })
  folioInterno: number;

  @Column({
    name: 'fecha_emision',
    type: 'datetime2',
    default: () => 'GETUTCDATE()',
  })
  fechaEmision: Date;

  @Column({ name: 'emitido_por', type: 'int', nullable: true })
  emitidoPor: number | null;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => CatTipoFactibilidad)
  @JoinColumn({ name: 'tipo_factibilidad_id', referencedColumnName: 'id' })
  tipoFactibilidad: CatTipoFactibilidad;

  @ManyToOne(() => CatMotivoNoFactible)
  @JoinColumn({ name: 'motivo_no_factible_id', referencedColumnName: 'id' })
  motivoNoFactible: CatMotivoNoFactible;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'emitido_por', referencedColumnName: 'id' })
  emitidoPorUsuario: Usuario;
}
