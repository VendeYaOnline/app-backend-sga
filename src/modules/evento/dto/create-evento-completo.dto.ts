import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsIn,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResolucionInlineDto {
  @ApiPropertyOptional({ description: 'ID del tribunal' })
  @IsOptional()
  @IsInt()
  tribunalId?: number;

  @ApiPropertyOptional({
    description: 'ID del tipo de causa (FK a CAT_TIPO_CAUSA)',
  })
  @IsOptional()
  @IsInt()
  tipoCausaId?: number;

  @ApiPropertyOptional({ description: 'RUC de la resolucion', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rucRes?: string;

  @ApiPropertyOptional({ description: 'RIT de la resolucion', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ritRes?: string;

  @ApiPropertyOptional({ description: 'ID CRR del PJUD', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  crrIdPjud?: string;

  @ApiPropertyOptional({
    description: 'ID del tipo de ley (FK a CAT_TIPO_LEY)',
  })
  @IsOptional()
  @IsInt()
  tipoLeyId?: number;

  @ApiPropertyOptional({ description: 'ID del CRS' })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'Numero de pena' })
  @IsOptional()
  @IsInt()
  @Min(1)
  numPena?: number;

  @ApiPropertyOptional({
    description: 'ID del tipo de pena sustitutiva (FK a CAT_PENA_SUSTITUTIVA)',
  })
  @IsOptional()
  @IsInt()
  tipoPenaId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de dicto de sentencia (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaDicto?: string;

  @ApiPropertyOptional({
    description: 'Fecha de recepcion en CRS (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaRecepcionCrs?: string;

  @ApiPropertyOptional({ description: 'Dias de condena' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCondena?: number;

  @ApiPropertyOptional({ description: 'Dias de abono', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasAbono?: number;

  @ApiPropertyOptional({ description: 'Dias efectivos de monitoreo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasMonitoreo?: number;

  @ApiPropertyOptional({
    description: 'Indica si la sentencia esta ejecutoriada',
  })
  @IsOptional()
  @IsBoolean()
  ejecutoriada?: boolean;

  @ApiPropertyOptional({ description: 'Plazo de monitoreo en dias' })
  @IsOptional()
  @IsInt()
  @Min(1)
  plazoMonitoreoDias?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de monitoreo (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaInicioMonitoreo?: string;

  @ApiPropertyOptional({
    description: 'Fecha de termino anterior (para prorrogas, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaTerminoAnterior?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha de termino (para prorrogas, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaTerminoNueva?: string;

  @ApiPropertyOptional({
    description: 'Consentimiento de la victima para monitoreo',
  })
  @IsOptional()
  @IsBoolean()
  victimaConsentimiento?: boolean;
}

export class CreateAgendamientoInlineDto {
  @ApiProperty({ description: 'Fecha y hora agendada (ISO 8601)' })
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

  @ApiPropertyOptional({ description: 'ID del CRS' })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'ID de la region donde se realiza la visita' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna donde se realiza la visita' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({ description: 'ID del tipo de lugar (CASA, APARTAMENTO, etc.)' })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional({
    description: 'Direccion de la agenda',
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

export class CreateProcesoInlineDto {
  @ApiPropertyOptional({
    description: 'ID del tecnico asignado (FK a USUARIO)',
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

  @ApiPropertyOptional({ description: 'ID de la region' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({
    description: 'Direccion donde se ejecuta el proceso',
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
    description: 'Para quien es el proceso',
    enum: ['CONDENADO', 'VICTIMA'],
    default: 'CONDENADO',
  })
  @IsOptional()
  @IsIn(['CONDENADO', 'VICTIMA'])
  paraQuien?: string;

  @ApiPropertyOptional({
    description: 'Numero de intento (1 para el primero)',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroIntento?: number;

  @ApiPropertyOptional({
    description: 'Indica si el proceso fue realizado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  realizado?: boolean;

  @ApiPropertyOptional({
    description: 'Notas adicionales del técnico sobre el proceso',
  })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional({
    description: 'Datos de agendamiento a crear junto con el proceso',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAgendamientoInlineDto)
  agendamiento?: CreateAgendamientoInlineDto;
}

export class CreateEventoCompletoDto {
  @ApiProperty({ description: 'ID del tipo de evento (FK a CAT_TIPO_EVENTO)' })
  @IsInt()
  tipoEventoId: number;

  @ApiProperty({ description: 'ID de la solicitud asociada' })
  @IsInt()
  solicitudId: number;

  @ApiPropertyOptional({ description: 'ID del usuario asignado' })
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({
    description: 'FK al evento padre (ej: decreto que origina una instalacion)',
  })
  @IsOptional()
  @IsInt()
  eventoPadreId?: number;

  @ApiPropertyOptional({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional({
    description: 'Origen de creacion del evento',
    default: 'FORMULARIO_WEB',
  })
  @IsOptional()
  @IsString()
  origenCreacion?: string;

  @ApiPropertyOptional({ description: 'Observaciones generales del evento' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description:
      'Datos de resolucion judicial (solo para tipos de evento de categoria Resolucion)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateResolucionInlineDto)
  resolucion?: CreateResolucionInlineDto;

  @ApiPropertyOptional({
    description:
      'Datos de proceso en terreno (solo para tipos de evento de categoria Proceso)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProcesoInlineDto)
  proceso?: CreateProcesoInlineDto;
}
