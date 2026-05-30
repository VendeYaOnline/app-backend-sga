import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_LUGAR')
export class CatTipoLugar {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_lugar', type: 'nvarchar', length: 200 })
  descripcionLugar: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
