import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { CatTipoZona } from '../../catalogo/entities/cat-tipo-zona.entity';
import { CatRegion } from '../../catalogo/entities/cat-region.entity';
import { CatComuna } from '../../catalogo/entities/cat-comuna.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.SOLICITUD_ZONA')
export class SolicitudZona {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @Column({ name: 'tipo_zona_id', type: 'int' })
  tipoZonaId: number;

  @Column({ name: 'region_id', type: 'int' })
  regionId: number;

  @Column({ name: 'comuna_id', type: 'int' })
  comunaId: number;

  @Column({ name: 'nombre_calle', type: 'nvarchar', length: 200, nullable: true })
  nombreCalle: string | null;

  @Column({ name: 'numero_direccion', type: 'nvarchar', length: 20, nullable: true })
  numeroDireccion: string | null;

  @Column({ name: 'numero_ruta', type: 'nvarchar', length: 50, nullable: true })
  numeroRuta: string | null;

  @Column({ name: 'poblacion', type: 'nvarchar', length: 200, nullable: true })
  poblacion: string | null;

  @Column({ name: 'codigo_postal', type: 'nvarchar', length: 10, nullable: true })
  codigoPostal: string | null;

  @Column({ name: 'radio_metros', type: 'int' })
  radioMetros: number;

  @Column({ name: 'latitud', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number | null;

  @Column({ name: 'longitud', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number | null;

  @Column({ name: 'url_mapa', type: 'nvarchar', length: 500, nullable: true })
  urlMapa: string | null;

  @Column({ name: 'es_reservada', type: 'bit', default: 0 })
  esReservada: boolean;

  @Column({ name: 'validada', type: 'bit', default: 0 })
  validada: boolean;

  @Column({ name: 'validada_at', type: 'datetime2', nullable: true })
  validadaAt: Date | null;

  @Column({ name: 'validada_by', type: 'int', nullable: true })
  validadaBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => CatTipoZona)
  @JoinColumn({ name: 'tipo_zona_id', referencedColumnName: 'id' })
  tipoZona: CatTipoZona;

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;

  @ManyToOne(() => CatComuna)
  @JoinColumn({ name: 'comuna_id', referencedColumnName: 'id' })
  comuna: CatComuna;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'validada_by', referencedColumnName: 'id' })
  validadoPor: Usuario;
}
