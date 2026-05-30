import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_FACTIBILIDAD')
export class CatTipoFactibilidad {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({
    name: 'descripcion_factibilidad',
    type: 'nvarchar',
    length: 200,
  })
  descripcionFactibilidad: string;

  @Column({ name: 'requiere_motivo', type: 'bit', default: 0 })
  requiereMotivo: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
