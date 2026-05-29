import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CatRegion } from './cat-region.entity';

@Entity('sga.CAT_COMUNA')
export class CatComuna {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'region_id', type: 'int' })
  regionId: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 10 })
  codigo: string;

  @Column({ name: 'nombre', type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;
}
