import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { CatTipoAccesorio } from '../../catalogo/entities/cat-tipo-accesorio.entity';
import { CatRolDispositivo } from '../../catalogo/entities/cat-rol-dispositivo.entity';

@Entity('sga.PROCESO_DISPOSITIVO')
export class ProcesoDispositivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({
    name: 'numero_serie',
    type: 'nvarchar',
    length: 100,
    nullable: true,
  })
  numeroSerie: string | null;

  @Column({ name: 'tipo_accesorio_id', type: 'int' })
  tipoAccesorioId: number;

  @Column({ name: 'rol_dispositivo_id', type: 'int' })
  rolDispositivoId: number;

  @Column({ name: 'fecha_registro', type: 'datetime2' })
  fechaRegistro: Date;

  @Column({
    name: 'observaciones',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  observaciones: string | null;

  @Column({ name: 'talla', type: 'nvarchar', length: 10, nullable: true })
  talla: string | null;

  @Column({ name: 'entregado', type: 'bit', nullable: true })
  entregado: boolean | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTipoAccesorio)
  @JoinColumn({ name: 'tipo_accesorio_id', referencedColumnName: 'id' })
  tipoAccesorio: CatTipoAccesorio;

  @ManyToOne(() => CatRolDispositivo)
  @JoinColumn({ name: 'rol_dispositivo_id', referencedColumnName: 'id' })
  rolDispositivo: CatRolDispositivo;
}
