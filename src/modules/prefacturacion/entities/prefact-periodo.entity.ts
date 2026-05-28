import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('sga.PREFACT_PERIODO')
export class PrefactPeriodo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'anio', type: 'smallint' })
  anio: number;

  @Column({ name: 'mes', type: 'tinyint' })
  mes: number;

  @Column({ name: 'cerrado', type: 'bit', default: 0 })
  cerrado: boolean;

  @Column({ name: 'cerrado_at', type: 'datetime2', nullable: true })
  cerradoAt: Date | null;

  @Column({ name: 'cerrado_by', type: 'int', nullable: true })
  cerradoBy: number | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cerrado_by', referencedColumnName: 'id' })
  cerradoPor: Usuario;
}
