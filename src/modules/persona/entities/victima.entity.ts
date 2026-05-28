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

@Entity('sga.VICTIMA')
export class Victima {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'es_extranjero', type: 'bit', default: 0 })
  esExtranjero: boolean;

  @Column({ name: 'tipo_identificacion_id', type: 'int', nullable: true })
  tipoIdentificacionId: number | null;

  @Column({ name: 'rut_victima', type: 'nvarchar', length: 12, nullable: true })
  rutVictima: string | null;

  @Column({ name: 'pasaporte_victima', type: 'nvarchar', length: 50, nullable: true })
  pasaporteVictima: string | null;

  @Column({ name: 'nombres', type: 'nvarchar', length: 100 })
  nombres: string;

  @Column({ name: 'apellido_paterno', type: 'nvarchar', length: 100 })
  apellidoPaterno: string;

  @Column({ name: 'apellido_materno', type: 'nvarchar', length: 100, nullable: true })
  apellidoMaterno: string | null;

  @Column({ name: 'sexo_id', type: 'int', nullable: true })
  sexoId: number | null;

  @Column({ name: 'email_victima', type: 'nvarchar', length: 255, nullable: true })
  emailVictima: string | null;

  @Column({ name: 'dato_reservado', type: 'bit', default: 0 })
  datoReservado: boolean;

  @Column({ name: 'consentimiento', type: 'bit', nullable: true })
  consentimiento: boolean | null;

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
}
