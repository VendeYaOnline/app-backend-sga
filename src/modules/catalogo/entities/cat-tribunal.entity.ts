import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CatRegion } from './cat-region.entity';

@Entity('sga.CAT_TRIBUNAL')
export class CatTribunal {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo_corte', type: 'int' })
  codigoCorte: number;

  @Column({ name: 'codigo_tribunal', type: 'int' })
  codigoTribunal: number;

  @Column({ name: 'nombre_tribunal', type: 'nvarchar', length: 200 })
  nombreTribunal: string;

  @Column({ name: 'tipo_tribunal', type: 'tinyint' })
  tipoTribunal: number;

  @Column({ name: 'region_id', type: 'int', nullable: true })
  regionId: number | null;

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
