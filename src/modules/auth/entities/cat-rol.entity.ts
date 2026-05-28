import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_ROL')
export class CatRol {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'nombre_rol', type: 'nvarchar', length: 200 })
  nombreRol: string;

  @Column({ name: 'descripcion_rol', type: 'nvarchar', length: 500, nullable: true })
  descripcionRol: string | null;
}
