import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proceso } from '../../evento/entities/proceso.entity';
import { CatRolDispositivo } from '../../catalogo/entities/cat-rol-dispositivo.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Victima } from '../../persona/entities/victima.entity';

@Entity('sga.PROCESO_DISPOSITIVO')
export class ProcesoDispositivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'para_quien', type: 'nvarchar', length: 10 })
  paraQuien: string;

  @Column({ name: 'condenado_id', type: 'int', nullable: true })
  condenadoId: number | null;

  @Column({ name: 'victima_id', type: 'int', nullable: true })
  victimaId: number | null;

  @Column({ name: 'agendamiento_id', type: 'int' })
  agendamientoId: number;

  @Column({ name: 'numero_serie', type: 'nvarchar', length: 100 })
  numeroSerie: string;

  @Column({ name: 'rol_dispositivo_id', type: 'int' })
  rolDispositivoId: number;

  @Column({ name: 'talla', type: 'nvarchar', length: 10, nullable: true })
  talla: string | null;

  @Column({ name: 'entregado', type: 'bit', nullable: true })
  entregado: boolean | null;

  @Column({ name: 'fecha_registro', type: 'datetime2' })
  fechaRegistro: Date;

  @Column({
    name: 'observaciones',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  observaciones: string | null;

  @ManyToOne(() => Proceso)
  @JoinColumn({ name: 'agendamiento_id', referencedColumnName: 'agendamientoId' })
  proceso: Proceso;

  @ManyToOne(() => CatRolDispositivo)
  @JoinColumn({ name: 'rol_dispositivo_id', referencedColumnName: 'id' })
  rolDispositivo: CatRolDispositivo;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado | null;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima | null;
}
