import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_ACCESORIO')
export class CatTipoAccesorio {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_accesorio', type: 'nvarchar', length: 200 })
  descripcionAccesorio: string;

  @Column({ name: 'tiene_serie', type: 'bit', default: 0 })
  tieneSerie: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
