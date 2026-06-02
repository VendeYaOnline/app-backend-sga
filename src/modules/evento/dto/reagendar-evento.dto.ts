import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReagendarEventoDto {
  @ApiProperty({
    description: 'ID del evento existente cuyo proceso se va a reagendar',
  })
  @IsInt()
  eventoId: number;

  @ApiProperty({
    description: 'Fecha y hora agendada para el nuevo agendamiento (ISO 8601)',
  })
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

  @ApiPropertyOptional({ description: 'ID del tecnico asignado' })
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({ description: 'ID del CRS para el agendamiento' })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'ID de la region para el agendamiento' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna para el agendamiento' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({
    description: 'ID del tipo de lugar (CASA, APARTAMENTO, etc.)',
  })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional({
    description: 'Direccion del agendamiento',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @ApiPropertyOptional({
    description: 'Notas del agendamiento',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
