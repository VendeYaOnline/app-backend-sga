import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgendamientoDto {
  @ApiProperty()
  @IsInt()
  eventoId: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
