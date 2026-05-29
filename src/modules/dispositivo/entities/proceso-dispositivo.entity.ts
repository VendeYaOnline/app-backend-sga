import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';
import { Dispositivo } from './dispositivo.entity';
import { CatRolDispositivo } from '../../catalogo/entities/cat-rol-dispositivo.entity';

@Entity('sga.PROCESO_DISPOSITIVO')
export class ProcesoDispositivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'dispositivo_id', type: 'int' })
  dispositivoId: number;

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

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => Dispositivo)
  @JoinColumn({ name: 'dispositivo_id', referencedColumnName: 'id' })
  dispositivo: Dispositivo;

  @ManyToOne(() => CatRolDispositivo)
  @JoinColumn({ name: 'rol_dispositivo_id', referencedColumnName: 'id' })
  rolDispositivo: CatRolDispositivo;
}
