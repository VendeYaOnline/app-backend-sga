import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProcesoDto {
  @ApiPropertyOptional({
    description: 'ID del técnico asignado (FK a USUARIO)',
  })
  @IsOptional()
  @IsInt()
  tecnicoId?: number;

  @ApiPropertyOptional({
    description: 'ID del CRS donde se ejecuta el proceso',
  })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'ID de la región' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({
    description: 'Dirección donde se ejecuta el proceso',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionProceso?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora programada para el proceso (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @ApiPropertyOptional({
    description: 'Para quién es el proceso',
    enum: ['CONDENADO', 'VICTIMA'],
    default: 'CONDENADO',
  })
  @IsOptional()
  @IsIn(['CONDENADO', 'VICTIMA'])
  paraQuien?: string;

  @ApiPropertyOptional({
    description: 'ID del proceso origen (para reintentos)',
  })
  @IsOptional()
  @IsInt()
  procesoOrigenId?: number;

  @ApiPropertyOptional({
    description: 'Número de intento (1 para el primero)',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroIntento?: number;

  @ApiPropertyOptional({ description: 'Hora de llegada al lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaLlegada?: string;

  @ApiPropertyOptional({ description: 'Hora de salida del lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaSalida?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales del técnico sobre el proceso',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}
