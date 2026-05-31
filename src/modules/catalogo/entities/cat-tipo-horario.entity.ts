import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_HORARIO')
export class CatTipoHorario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_horario', type: 'nvarchar', length: 200 })
  descripcionHorario: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
