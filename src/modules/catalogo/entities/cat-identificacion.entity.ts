import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_IDENTIFICACION')
export class CatIdentificacion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_id', type: 'nvarchar', length: 200 })
  descripcionId: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
