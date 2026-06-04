import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { CatTipoProblemaSt } from '../../catalogo/entities/cat-tipo-problema-st.entity';

@Entity('sga.PROCESO_SOPORTE_MOTIVO')
export class ProcesoSoporteMotivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'agendamiento_id', type: 'int' })
  agendamientoId: number;

  @Column({ name: 'tipo_problema_id', type: 'int' })
  tipoProblemaId: number;

  @Column({
    name: 'momento',
    type: 'nvarchar',
    length: 20,
    default: 'AGENDAMIENTO',
  })
  momento: string;

  @Column({
    name: 'observacion',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  observacion: string | null;

  @ManyToOne(() => Agendamiento)
  @JoinColumn({
    name: 'agendamiento_id',
    referencedColumnName: 'id',
  })
  agendamiento: Agendamiento;

  @ManyToOne(() => CatTipoProblemaSt)
  @JoinColumn({ name: 'tipo_problema_id', referencedColumnName: 'id' })
  tipoProblema: CatTipoProblemaSt;
}
