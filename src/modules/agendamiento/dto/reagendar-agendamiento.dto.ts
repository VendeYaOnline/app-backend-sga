import {
  IsDateString,
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReagendarAgendamientoDto {
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
    description:
      'ID del técnico ejecutor en terreno (si no se pasa, hereda del original)',
  })
  @IsOptional()
  @IsInt()
  tecnicoId?: number;

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
  @IsString()
  @MaxLength(500)
  notas?: string;
}
