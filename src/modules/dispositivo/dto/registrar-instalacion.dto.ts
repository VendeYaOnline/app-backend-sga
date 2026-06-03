import {
  IsArray,
  IsOptional,
  IsInt,
  IsString,
  IsIn,
  IsBoolean,
  IsDateString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProcesoDispositivoDto } from './create-proceso-dispositivo.dto';

export class UpdateProcesoInlineDto {
  @ApiPropertyOptional({
    description: 'Fecha y hora de ejecución real (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  fechaEjecucion?: string;

  @ApiPropertyOptional({ description: 'Hora de llegada al lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaLlegada?: string;

  @ApiPropertyOptional({ description: 'Hora de salida del lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaSalida?: string;

  @ApiPropertyOptional({ description: 'Indica si el proceso fue realizado' })
  @IsOptional()
  @IsBoolean()
  realizado?: boolean;

  @ApiPropertyOptional({ description: 'ID del motivo si no se realizó' })
  @IsOptional()
  @IsInt()
  motivoNoRealizadoId?: number;

  @ApiPropertyOptional({
    description: 'Detalle si no se realizó',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalleNoRealizado?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales del técnico' })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional({ description: 'ID de la región donde se ejecutó' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna donde se ejecutó' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({
    description: 'Dirección real donde se ejecutó',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionProceso?: string;
}

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

  @ApiPropertyOptional({
    description: 'Dirección de la agenda',
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
    description: 'Datos a actualizar en el agendamiento asociado al proceso',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAgendamientoInlineDto)
  agendamiento?: UpdateAgendamientoInlineDto;

  @ApiPropertyOptional({
    description: 'Datos a actualizar en el proceso',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProcesoInlineDto)
  proceso?: UpdateProcesoInlineDto;
}
