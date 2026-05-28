import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CatIdentificacion } from '../../catalogo/entities/cat-identificacion.entity';
import { CatSexo } from '../../catalogo/entities/cat-sexo.entity';
import { CatIdentidadGenero } from '../../catalogo/entities/cat-identidad-genero.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatParentesco } from '../../catalogo/entities/cat-parentesco.entity';

@Entity('sga.CONDENADO')
export class Condenado {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'es_extranjero', type: 'bit', default: 0 })
  esExtranjero: boolean;

  @Column({ name: 'tipo_identificacion_id', type: 'int' })
  tipoIdentificacionId: number;

  @Column({ name: 'rut_condenado', type: 'nvarchar', length: 12, nullable: true })
  rutCondenado: string | null;

  @Column({ name: 'pasaporte', type: 'nvarchar', length: 50, nullable: true })
  pasaporte: string | null;

  @Column({ name: 'nombres', type: 'nvarchar', length: 100 })
  nombres: string;

  @Column({ name: 'apellido_paterno', type: 'nvarchar', length: 100 })
  apellidoPaterno: string;

  @Column({ name: 'apellido_materno', type: 'nvarchar', length: 100, nullable: true })
  apellidoMaterno: string | null;

  @Column({ name: 'nombre_social', type: 'nvarchar', length: 100, nullable: true })
  nombreSocial: string | null;

  @Column({ name: 'sexo_id', type: 'int', nullable: true })
  sexoId: number | null;

  @Column({ name: 'identidad_genero_id', type: 'int', nullable: true })
  identidadGeneroId: number | null;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: string | null;

  @Column({ name: 'email_condenado', type: 'nvarchar', length: 255, nullable: true })
  emailCondenado: string | null;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({ name: 'contacto_emergencia_nombre', type: 'nvarchar', length: 100, nullable: true })
  contactoEmergenciaNombre: string | null;

  @Column({ name: 'contacto_emergencia_apellido', type: 'nvarchar', length: 100, nullable: true })
  contactoEmergenciaApellido: string | null;

  @Column({ name: 'contacto_emergencia_parentesco_id', type: 'int', nullable: true })
  contactoEmergenciaParentescoId: number | null;

  @Column({ name: 'contacto_emergencia_telefono', type: 'nvarchar', length: 20, nullable: true })
  contactoEmergenciaTelefono: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @ManyToOne(() => CatIdentificacion)
  @JoinColumn({ name: 'tipo_identificacion_id', referencedColumnName: 'id' })
  tipoIdentificacion: CatIdentificacion;

  @ManyToOne(() => CatSexo)
  @JoinColumn({ name: 'sexo_id', referencedColumnName: 'id' })
  sexo: CatSexo;

  @ManyToOne(() => CatIdentidadGenero)
  @JoinColumn({ name: 'identidad_genero_id', referencedColumnName: 'id' })
  identidadGenero: CatIdentidadGenero;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatParentesco)
  @JoinColumn({ name: 'contacto_emergencia_parentesco_id', referencedColumnName: 'id' })
  contactoEmergenciaParentesco: CatParentesco;
}
