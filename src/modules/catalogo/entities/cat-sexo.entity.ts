import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_SEXO')
export class CatSexo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_sexo', type: 'nvarchar', length: 200 })
  descripcionSexo: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
