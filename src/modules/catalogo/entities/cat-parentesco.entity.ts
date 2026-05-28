import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_PARENTESCO')
export class CatParentesco {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_parentesco', type: 'nvarchar', length: 200 })
  descripcionParentesco: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
