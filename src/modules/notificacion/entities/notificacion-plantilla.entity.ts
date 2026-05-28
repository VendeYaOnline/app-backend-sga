import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CatRol } from '../../auth/entities/cat-rol.entity';

@Entity('sga.NOTIFICACION_PLANTILLA')
export class NotificacionPlantilla {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50, unique: true })
  codigo: string;

  @Column({ name: 'titulo', type: 'nvarchar', length: 200 })
  titulo: string;

  @Column({ name: 'mensaje_plantilla', type: 'nvarchar', length: 'max' })
  mensajePlantilla: string;

  @Column({ name: 'evento_disparador', type: 'nvarchar', length: 100 })
  eventoDisparador: string;

  @Column({ name: 'entidad_origen', type: 'nvarchar', length: 50 })
  entidadOrigen: string;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'envia_app', type: 'bit', default: 1 })
  enviaApp: boolean;

  @Column({ name: 'envia_correo', type: 'bit', default: 1 })
  enviaCorreo: boolean;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;
}
