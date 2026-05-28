import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_DIA')
export class CatTipoDia {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_dia', type: 'nvarchar', length: 200 })
  descripcionDia: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
