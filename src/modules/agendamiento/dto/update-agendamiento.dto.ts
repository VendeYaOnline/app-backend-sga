import {
  IsOptional,
  IsDateString,
  IsInt,
  IsString,
  IsIn,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAgendamientoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaAgendada?: string;

  @ApiPropertyOptional({
    description: 'Para quién es el proceso',
    enum: ['CONDENADO', 'VICTIMA'],
  })
  @IsOptional()
  @IsIn(['CONDENADO', 'VICTIMA'])
  paraQuien?: string;

  @ApiPropertyOptional({ description: 'ID del condenado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({ description: 'ID de la víctima' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  victimaId?: number;

  @ApiPropertyOptional({ description: 'URL para soportes virtuales' })
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

  @ApiPropertyOptional({ description: 'Agendamiento vigente del evento' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esVigente?: boolean;

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
  @Type(() => Number)
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({
    description:
      'ID del técnico que ejecutará el proceso en terreno (puede diferir de asignadoA)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @ApiPropertyOptional({
    description: 'Número de intento secuencial',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numeroIntento?: number;

  @ApiPropertyOptional({
    description: 'ID del motivo por el que no se pudo ejecutar',
  })
  @IsOptional()
  @Type(() => Number)
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
