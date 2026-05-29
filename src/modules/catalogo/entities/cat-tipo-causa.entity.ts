import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('sga.CAT_TIPO_CAUSA')
export class CatTipoCausa {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ name: 'descripcion_causa', type: 'nvarchar', length: 200 })
  descripcionCausa: string;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
