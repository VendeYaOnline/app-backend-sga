import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sga.CAT_PROPOSITO_ARCHIVO')
export class CatPropositoArchivo {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo', type: 'nvarchar', length: 50, unique: true })
  codigo: string;

  @Column({ name: 'descripcion_proposito', type: 'nvarchar', length: 200 })
  descripcionProposito: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
  updatedAt: Date;
}
