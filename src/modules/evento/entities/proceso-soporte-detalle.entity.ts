import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Proceso } from './proceso.entity';

@Entity('sga.PROCESO_SOPORTE_DETALLE')
export class ProcesoSoporteDetalle {
  @PrimaryColumn({ name: 'agendamiento_id', type: 'int' })
  agendamientoId: number;

  @Column({
    name: 'medio_contacto',
    type: 'nvarchar',
    length: 30,
    nullable: true,
  })
  medioContacto: string | null;

  @Column({
    name: 'observaciones_soporte',
    type: 'nvarchar',
    length: 'max',
    nullable: true,
  })
  observacionesSoporte: string | null;

  @ManyToOne(() => Proceso)
  @JoinColumn({
    name: 'agendamiento_id',
    referencedColumnName: 'agendamientoId',
  })
  proceso: Proceso;
}
