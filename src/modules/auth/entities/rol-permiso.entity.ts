import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CatRol } from './cat-rol.entity';
import { CatPermiso } from './cat-permiso.entity';

@Entity('sga.ROL_PERMISO')
export class RolPermiso {
  @PrimaryColumn({ name: 'rol_id', type: 'int' })
  rolId: number;

  @PrimaryColumn({ name: 'permiso_id', type: 'int' })
  permisoId: number;

  @ManyToOne(() => CatRol)
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol: CatRol;

  @ManyToOne(() => CatPermiso)
  @JoinColumn({ name: 'permiso_id', referencedColumnName: 'id' })
  permiso: CatPermiso;
}
