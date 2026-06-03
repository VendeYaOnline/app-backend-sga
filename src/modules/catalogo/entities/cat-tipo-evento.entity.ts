import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sga.CAT_TIPO_EVENTO')
export class CatTipoEvento {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ name: 'descripcion_evento', type: 'nvarchar', length: 200 })
  descripcionEvento: string;

  @Column({ name: 'requiere_agendamiento', type: 'bit', default: 0 })
  requiereAgendamiento: boolean;

  @Column({ name: 'requiere_documento', type: 'bit', default: 0 })
  requiereDocumento: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;
}
