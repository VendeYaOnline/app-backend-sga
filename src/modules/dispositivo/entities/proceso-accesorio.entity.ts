import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { CatTipoAccesorio } from '../../catalogo/entities/cat-tipo-accesorio.entity';

@Entity('sga.PROCESO_ACCESORIO')
export class ProcesoAccesorio {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'tipo_accesorio_id', type: 'int' })
  tipoAccesorioId: number;

  @Column({ name: 'numero_serie', type: 'nvarchar', length: 100, nullable: true })
  numeroSerie: string | null;

  @Column({ name: 'observaciones', type: 'nvarchar', length: 500, nullable: true })
  observaciones: string | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTipoAccesorio)
  @JoinColumn({ name: 'tipo_accesorio_id', referencedColumnName: 'id' })
  tipoAccesorio: CatTipoAccesorio;
}
