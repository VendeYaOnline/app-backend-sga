import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sga.CAT_TIPO_LEY')
export class CatTipoLey {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ name: 'nombre_ley', type: 'nvarchar', length: 200 })
  nombreLey: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;
}
