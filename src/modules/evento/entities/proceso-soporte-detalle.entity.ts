import {
  Entity, PrimaryColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Evento } from './evento.entity';
import { CatTipoProblemaSt } from '../../catalogo/entities/cat-tipo-problema-st.entity';

@Entity('sga.PROCESO_SOPORTE_DETALLE')
export class ProcesoSoporteDetalle {
  @PrimaryColumn({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'tipo_problema_id', type: 'int', nullable: true })
  tipoProblemaId: number | null;

  @Column({ name: 'requiere_cambio_dispositivo', type: 'bit', default: 0 })
  requiereCambioDispositivo: boolean;

  @Column({ name: 'medio_contacto', type: 'nvarchar', length: 30, nullable: true })
  medioContacto: string | null;

  @Column({ name: 'observaciones_soporte', type: 'nvarchar', length: 'max', nullable: true })
  observacionesSoporte: string | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTipoProblemaSt)
  @JoinColumn({ name: 'tipo_problema_id', referencedColumnName: 'id' })
  tipoProblema: CatTipoProblemaSt;
}
