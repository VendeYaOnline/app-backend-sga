import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_PENA_SUSTITUTIVA')
export class CatPenaSustitutiva {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'nombre_pena', type: 'nvarchar', length: 200 })
  nombrePena: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
