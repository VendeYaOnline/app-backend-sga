import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_IDENTIDAD_GENERO')
export class CatIdentidadGenero {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_genero', type: 'nvarchar', length: 200 })
  descripcionGenero: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
