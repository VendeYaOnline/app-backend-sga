import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_ZONA')
export class CatTipoZona {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_zona', type: 'nvarchar', length: 200 })
  descripcionZona: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
