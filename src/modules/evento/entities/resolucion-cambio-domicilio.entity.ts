import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';
import { CatMotivoNoFactible } from '../../catalogo/entities/cat-motivo-no-factible.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Entity('sga.RESOLUCION_CAMBIO_DOMICILIO')
export class ResolucionCambioDomicilio {
  @PrimaryColumn({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({
    name: 'subtipo_cambio',
    type: 'nvarchar',
    length: 20,
    nullable: true,
  })
  subtipoCambio: string | null;

  @Column({
    name: 'factibilidad_cd',
    type: 'nvarchar',
    length: 20,
    nullable: true,
  })
  factibilidadCd: string | null;

  @Column({ name: 'motivo_no_factible_id', type: 'int', nullable: true })
  motivoNoFactibleId: number | null;

  @Column({ name: 'revalidar', type: 'bit', default: 0 })
  revalidar: boolean;

  @Column({ name: 'visto', type: 'bit', default: 0 })
  visto: boolean;

  @Column({ name: 'solicitud_generada_id', type: 'int', nullable: true })
  solicitudGeneradaId: number | null;

  @OneToOne(() => Evento, (e) => e.resolucionCambioDomicilio)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatMotivoNoFactible)
  @JoinColumn({ name: 'motivo_no_factible_id', referencedColumnName: 'id' })
  motivoNoFactible: CatMotivoNoFactible;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_generada_id', referencedColumnName: 'id' })
  solicitudGenerada: Solicitud;
}
