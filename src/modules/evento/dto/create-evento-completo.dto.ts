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

  @ApiPropertyOptional({ description: 'ID del tipo de causa (FK a CAT_TIPO_CAUSA)' })
  @IsOptional()
  @IsInt()
  tipoCausaId?: number;

  @ApiPropertyOptional({ description: 'RUC de la resolución', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rucRes?: string;

  @ApiPropertyOptional({ description: 'RIT de la resolución', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ritRes?: string;

  @ApiPropertyOptional({ description: 'ID CRR del PJUD', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  crrIdPjud?: string;

  @ApiPropertyOptional({ description: 'ID del tipo de ley (FK a CAT_TIPO_LEY)' })
  @IsOptional()
  @IsInt()
  tipoLeyId?: number;

  @ApiPropertyOptional({ description: 'ID del CRS' })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'Número de pena' })
  @IsOptional()
  @IsInt()
  @Min(1)
  numPena?: number;

  @ApiPropertyOptional({ description: 'ID del tipo de pena sustitutiva (FK a CAT_PENA_SUSTITUTIVA)' })
  @IsOptional()
  @IsInt()
  tipoPenaId?: number;

  @ApiPropertyOptional({ description: 'Fecha de dicto de sentencia (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDicto?: string;

  @ApiPropertyOptional({ description: 'Fecha de recepción en CRS (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaRecepcionCrs?: string;

  @ApiPropertyOptional({ description: 'Días de condena' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCondena?: number;

  @ApiPropertyOptional({ description: 'Días de abono', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasAbono?: number;

  @ApiPropertyOptional({ description: 'Días efectivos de monitoreo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasMonitoreo?: number;

  @ApiPropertyOptional({ description: 'Indica si la sentencia está ejecutoriada' })
  @IsOptional()
  @IsBoolean()
  ejecutoriada?: boolean;

  @ApiPropertyOptional({ description: 'Plazo de monitoreo en días' })
  @IsOptional()
  @IsInt()
  @Min(1)
  plazoMonitoreoDias?: number;

  @ApiPropertyOptional({ description: 'Fecha de inicio de monitoreo (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaInicioMonitoreo?: string;

  @ApiPropertyOptional({ description: 'Fecha de término anterior (para prórrogas, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaTerminoAnterior?: string;

  @ApiPropertyOptional({ description: 'Nueva fecha de término (para prórrogas, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaTerminoNueva?: string;

  @ApiPropertyOptional({ description: 'Consentimiento de la víctima para monitoreo' })
  @IsOptional()
  @IsBoolean()
  victimaConsentimiento?: boolean;
}

export class CreateProcesoInlineDto {
  @ApiPropertyOptional({ description: 'ID del técnico asignado (FK a USUARIO)' })
  @IsOptional()
  @IsInt()
  tecnicoId?: number;

  @ApiPropertyOptional({ description: 'ID del CRS donde se ejecuta el proceso' })
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

  @ApiPropertyOptional({ description: 'Dirección donde se ejecuta el proceso', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionProceso?: string;

  @ApiPropertyOptional({ description: 'Fecha y hora programada para el proceso (ISO 8601)' })
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

  @ApiPropertyOptional({ description: 'ID del proceso origen (para reintentos)' })
  @IsOptional()
  @IsInt()
  procesoOrigenId?: number;

  @ApiPropertyOptional({ description: 'Número de intento (1 para el primero)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroIntento?: number;
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

  @ApiPropertyOptional({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional({ description: 'Origen de creación del evento', default: 'FORMULARIO_WEB' })
  @IsOptional()
  @IsString()
  origenCreacion?: string;

  @ApiPropertyOptional({ description: 'Observaciones generales del evento' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Datos de resolución judicial (solo para tipos de evento de categoría Resolución)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateResolucionInlineDto)
  resolucion?: CreateResolucionInlineDto;

  @ApiPropertyOptional({ description: 'Datos de proceso en terreno (solo para tipos de evento de categoría Proceso)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProcesoInlineDto)
  proceso?: CreateProcesoInlineDto;
}
