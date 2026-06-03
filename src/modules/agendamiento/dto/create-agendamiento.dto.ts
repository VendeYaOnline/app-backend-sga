import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgendamientoDto {
  @ApiProperty()
  @IsInt()
  eventoId: number;

  @ApiProperty({
    description: 'ID del CRS (obligatorio, filtro de cola de técnicos)',
  })
  @IsInt()
  crsId: number;

  @ApiProperty({
    description: 'Para quién es el proceso',
    enum: ['CONDENADO', 'VICTIMA'],
    default: 'CONDENADO',
  })
  @IsIn(['CONDENADO', 'VICTIMA'])
  paraQuien: string;

  @ApiPropertyOptional({
    description: 'ID del condenado (obligatorio si paraQuien = CONDENADO)',
  })
  @IsOptional()
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({
    description: 'ID de la víctima (obligatorio si paraQuien = VICTIMA)',
  })
  @IsOptional()
  @IsInt()
  victimaId?: number;

  @ApiProperty()
  @IsDateString()
  fechaAgendada: string;

  @ApiPropertyOptional({ description: 'Hora inicio del rango (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaInicioRango?: string;

  @ApiPropertyOptional({ description: 'Hora fin del rango (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaFinRango?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({
    description: 'URL para soportes virtuales (Teams, Zoom, etc.)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  urlAcceso?: string;

  @ApiPropertyOptional({
    description: 'Tipo de soporte (solo para procesos SOPORTE)',
    enum: ['PRESENCIAL', 'VIRTUAL'],
  })
  @IsOptional()
  @IsIn(['PRESENCIAL', 'VIRTUAL'])
  tipoSoporte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @ApiPropertyOptional({
    description: 'Número de intento secuencial',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  numeroIntento?: number;

  @ApiPropertyOptional({
    description: 'ID del motivo por el que no se pudo ejecutar',
  })
  @IsOptional()
  @IsInt()
  motivoNoRealizadoId?: number;

  @ApiPropertyOptional({
    description: 'Detalle adicional del motivo de no realización',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalleNoRealizado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
