import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_MEDIDA_CONTROL')
export class CatMedidaControl {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion', type: 'nvarchar', length: 200 })
  descripcion: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
