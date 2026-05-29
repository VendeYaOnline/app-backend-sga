import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Evento } from './evento.entity';
import { CatTipoProblemaSt } from '../../catalogo/entities/cat-tipo-problema-st.entity';

@Entity('sga.PROCESO_SOPORTE_MOTIVO')
export class ProcesoSoporteMotivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'tipo_problema_id', type: 'int' })
  tipoProblemaId: number;

  @Column({ name: 'es_motivo_principal', type: 'bit', default: 0 })
  esMotivoPrincipal: boolean;

  @Column({ name: 'observacion', type: 'nvarchar', length: 500, nullable: true })
  observacion: string | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTipoProblemaSt)
  @JoinColumn({ name: 'tipo_problema_id', referencedColumnName: 'id' })
  tipoProblema: CatTipoProblemaSt;
}
