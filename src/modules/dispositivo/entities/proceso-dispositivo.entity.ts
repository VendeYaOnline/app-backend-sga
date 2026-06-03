import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proceso } from '../../evento/entities/proceso.entity';
import { CatRolDispositivo } from '../../catalogo/entities/cat-rol-dispositivo.entity';

@Entity('sga.PROCESO_DISPOSITIVO')
export class ProcesoDispositivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'agendamiento_id', type: 'int' })
  agendamientoId: number;

  @Column({
    name: 'numero_serie',
    type: 'nvarchar',
    length: 100,
  })
  numeroSerie: string;

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

  @ManyToOne(() => Proceso)
  @JoinColumn({
    name: 'agendamiento_id',
    referencedColumnName: 'agendamientoId',
  })
  proceso: Proceso;

  @ManyToOne(() => CatRolDispositivo)
  @JoinColumn({ name: 'rol_dispositivo_id', referencedColumnName: 'id' })
  rolDispositivo: CatRolDispositivo;
}
