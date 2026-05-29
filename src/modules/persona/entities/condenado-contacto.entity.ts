import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Condenado } from './condenado.entity';

@Entity('sga.CONDENADO_CONTACTO')
export class CondenadoContacto {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'condenado_id', type: 'int' })
  condenadoId: number;

  @Column({ name: 'tipo_contacto', type: 'nvarchar', length: 30 })
  tipoContacto: string;

  @Column({ name: 'valor_contacto', type: 'nvarchar', length: 100 })
  valorContacto: string;

  @Column({ name: 'es_principal', type: 'bit', default: 0 })
  esPrincipal: boolean;

  @ManyToOne(() => Condenado)
  @JoinColumn({ name: 'condenado_id', referencedColumnName: 'id' })
  condenado: Condenado;
}
