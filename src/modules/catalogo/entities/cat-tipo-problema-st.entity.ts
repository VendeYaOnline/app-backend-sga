import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_PROBLEMA_ST')
export class CatTipoProblemaSt {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_problema', type: 'nvarchar', length: 200 })
  descripcionProblema: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
