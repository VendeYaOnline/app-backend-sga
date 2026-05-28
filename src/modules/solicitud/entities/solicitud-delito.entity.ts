import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { CatDelito } from '../../catalogo/entities/cat-delito.entity';

@Entity('sga.SOLICITUD_DELITO')
export class SolicitudDelito {
  @PrimaryColumn({ name: 'solicitud_id', type: 'int' })
  solicitudId: number;

  @PrimaryColumn({ name: 'delito_id', type: 'int' })
  delitoId: number;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud: Solicitud;

  @ManyToOne(() => CatDelito)
  @JoinColumn({ name: 'delito_id', referencedColumnName: 'id' })
  delito: CatDelito;
}
