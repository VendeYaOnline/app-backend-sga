import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_DELITO')
export class CatDelito {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_delito', type: 'nvarchar', length: 500 })
  descripcionDelito: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
