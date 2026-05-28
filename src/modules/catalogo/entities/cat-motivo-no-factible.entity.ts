import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_MOTIVO_NO_FACTIBLE')
export class CatMotivoNoFactible {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_motivo', type: 'nvarchar', length: 300 })
  descripcionMotivo: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
