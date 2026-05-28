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
import { CatRegion } from '../../catalogo/entities/cat-region.entity';
import { CatCrs } from '../../catalogo/entities/cat-crs.entity';
import { CatTribunal } from '../../catalogo/entities/cat-tribunal.entity';

@Entity('sga.USUARIO')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'username', type: 'nvarchar', length: 50 })
  username: string;

  @Column({ name: 'email', type: 'nvarchar', length: 255 })
  email: string;

  @Column({ name: 'rut', type: 'nvarchar', length: 12 })
  rut: string;

  @Column({ name: 'nombres', type: 'nvarchar', length: 100 })
  nombres: string;

  @Column({ name: 'apellido_paterno', type: 'nvarchar', length: 100 })
  apellidoPaterno: string;

  @Column({ name: 'apellido_materno', type: 'nvarchar', length: 100, nullable: true })
  apellidoMaterno: string | null;

  @Column({ name: 'telefono_movil', type: 'nvarchar', length: 20, nullable: true })
  telefonoMovil: string | null;

  @Column({ name: 'telefono_fijo', type: 'nvarchar', length: 20, nullable: true })
  telefonoFijo: string | null;

  @Column({ name: 'region_id', type: 'int', nullable: true })
  regionId: number | null;

  @Column({ name: 'crs_id', type: 'int', nullable: true })
  crsId: number | null;

  @Column({ name: 'tribunal_id', type: 'int', nullable: true })
  tribunalId: number | null;

  @Column({ name: 'pass_hash', type: 'nvarchar', length: 255, nullable: true })
  passHash: string | null;

  @Column({ name: 'debe_cambiar_pass', type: 'bit', default: 0 })
  debeCambiarPass: boolean;

  @Column({ name: 'intentos_fallidos', type: 'smallint', default: 0 })
  intentosFallidos: number;

  @Column({ name: 'bloqueado', type: 'bit', default: 0 })
  bloqueado: boolean;

  @Column({ name: 'bloqueado_at', type: 'datetime2', nullable: true })
  bloqueadoAt: Date | null;

  @Column({ name: 'ultimo_login', type: 'datetime2', nullable: true })
  ultimoLogin: Date | null;

  @Column({ name: 'activo', type: 'bit', default: 1 })
  activo: boolean;

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

  @ManyToOne(() => CatRegion)
  @JoinColumn({ name: 'region_id', referencedColumnName: 'id' })
  region: CatRegion;

  @ManyToOne(() => CatCrs)
  @JoinColumn({ name: 'crs_id', referencedColumnName: 'id' })
  crs: CatCrs;

  @ManyToOne(() => CatTribunal)
  @JoinColumn({ name: 'tribunal_id', referencedColumnName: 'id' })
  tribunal: CatTribunal;
}
