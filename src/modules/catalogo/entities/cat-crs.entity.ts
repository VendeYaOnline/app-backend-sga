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

@Entity('sga.CAT_CRS')
export class CatCrs {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'nombre_crs', type: 'nvarchar', length: 200 })
  nombreCrs: string;

  @Column({ name: 'region_id', type: 'int', nullable: true })
  regionId: number | null;

  @Column({
    name: 'direccion_crs',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  direccionCrs: string | null;

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
