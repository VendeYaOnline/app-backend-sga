import {
  IsArray,
  IsOptional,
  IsInt,
  IsString,
  IsIn,
  IsDateString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProcesoDispositivoDto } from './create-proceso-dispositivo.dto';

export class UpdateAgendamientoInlineDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado del agendamiento',
    enum: ['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'])
  estadoAgenda?: string;

  @ApiPropertyOptional({ description: 'Fecha y hora agendada (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fechaAgendada?: string;

  @ApiPropertyOptional({ description: 'Hora inicio del rango (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaInicioRango?: string;

  @ApiPropertyOptional({ description: 'Hora fin del rango (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaFinRango?: string;

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({ description: 'ID del CRS' })
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

  @ApiPropertyOptional({ description: 'ID del tipo de lugar' })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional({ description: 'Dirección de la agenda', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @ApiPropertyOptional({ description: 'Notas del agendamiento', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}

export class RegistrarInstalacionDto {
  @ApiProperty({
    type: [CreateProcesoDispositivoDto],
    description: 'Dispositivos a registrar en la instalación',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcesoDispositivoDto)
  dispositivos: CreateProcesoDispositivoDto[];

  @ApiPropertyOptional({
    description: 'ID del agendamiento a actualizar. Si no se envía y el proceso tiene agendamiento, se usa el del proceso.',
  })
  @IsOptional()
  @IsInt()
  agendamientoId?: number;

  @ApiPropertyOptional({
    description: 'Datos a actualizar en el agendamiento',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAgendamientoInlineDto)
  agendamiento?: UpdateAgendamientoInlineDto;
}
