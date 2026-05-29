import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.ARCHIVO')
export class Archivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'uuid', type: 'uniqueidentifier' })
  uuid: string;

  @Column({ name: 'ruta_relativa', type: 'nvarchar', length: 500 })
  rutaRelativa: string;

  @Column({ name: 'nombre_original', type: 'nvarchar', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'mime_type', type: 'nvarchar', length: 100 })
  mimeType: string;

  @Column({ name: 'tamano_bytes', type: 'bigint' })
  tamanoBytes: number;

  @Column({ name: 'hash_sha256', type: 'char', length: 64, unique: true })
  hashSha256: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  creador: Usuario;
}
