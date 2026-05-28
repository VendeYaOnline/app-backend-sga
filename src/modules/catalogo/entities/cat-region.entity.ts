import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sga.CAT_REGION')
export class CatRegion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

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
}
