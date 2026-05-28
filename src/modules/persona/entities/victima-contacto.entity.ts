import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Victima } from './victima.entity';

@Entity('sga.VICTIMA_CONTACTO')
export class VictimaContacto {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'victima_id', type: 'int' })
  victimaId: number;

  @Column({ name: 'tipo_contacto', type: 'nvarchar', length: 30 })
  tipoContacto: string;

  @Column({ name: 'valor_contacto', type: 'nvarchar', length: 100 })
  valorContacto: string;

  @Column({ name: 'es_principal', type: 'bit', default: 0 })
  esPrincipal: boolean;

  @ManyToOne(() => Victima)
  @JoinColumn({ name: 'victima_id', referencedColumnName: 'id' })
  victima: Victima;
}
