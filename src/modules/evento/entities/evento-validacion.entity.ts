import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Evento } from './evento.entity';
import { CatTipoEventoValidacion } from '../../catalogo/entities/cat-tipo-evento-validacion.entity';
import { CatRol } from '../../auth/entities/cat-rol.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.EVENTO_VALIDACION')
export class EventoValidacion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'evento_id', type: 'int' })
  eventoId: number;

  @Column({ name: 'tipo_evento_validacion_id', type: 'int' })
  tipoEventoValidacionId: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @Column({ name: 'estado', type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estado: string;

  @Column({ name: 'fecha_validacion', type: 'datetime2', nullable: true })
  fechaValidacion: Date | null;

  @Column({ name: 'observaciones', type: 'nvarchar', length: 500, nullable: true })
  observaciones: string | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id', referencedColumnName: 'id' })
  evento: Evento;

  @ManyToOne(() => CatTipoEventoValidacion)
  @JoinColumn({ name: 'tipo_evento_validacion_id', referencedColumnName: 'id' })
  tipoEventoValidacion: CatTipoEventoValidacion;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
  usuario: Usuario;
}
