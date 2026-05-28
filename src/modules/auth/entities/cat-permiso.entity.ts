import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_PERMISO')
export class CatPermiso {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 100 })
  codigo: string;

  @Column({ name: 'nombre_permiso', type: 'nvarchar', length: 200 })
  nombrePermiso: string;
}
