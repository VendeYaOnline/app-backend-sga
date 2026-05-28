import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { CatTipoAccesorio } from '../../catalogo/entities/cat-tipo-accesorio.entity';

@Entity('sga.DISPOSITIVO')
export class Dispositivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'tipo_accesorio_id', type: 'int' })
  tipoAccesorioId: number;

  @Column({ name: 'numero_serie', type: 'nvarchar', length: 100, unique: true })
  numeroSerie: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @ManyToOne(() => CatTipoAccesorio)
  @JoinColumn({ name: 'tipo_accesorio_id', referencedColumnName: 'id' })
  tipoAccesorio: CatTipoAccesorio;
}
