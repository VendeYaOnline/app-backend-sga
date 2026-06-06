import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecepcionDecretoDto {
  @ApiProperty({ description: 'ID CRR del decreto en PJUD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  crrIdPjud: string;

  @ApiProperty({ description: 'ID de la solicitud asociada en SGA' })
  @IsInt()
  solicitudId: number;

  @ApiProperty({
    description: 'ID del tipo de evento (ej: DECRETO_MONITOREO_INICIAL)',
  })
  @IsInt()
  tipoEventoId: number;

  @ApiPropertyOptional({ description: 'ID del tribunal' })
  @IsOptional()
  @IsInt()
  tribunalId?: number;

  @ApiPropertyOptional({ description: 'ID del tipo de causa' })
  @IsOptional()
  @IsInt()
  tipoCausaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rucRes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ritRes?: string;

  @ApiPropertyOptional({ description: 'ID del tipo de ley' })
  @IsOptional()
  @IsInt()
  tipoLeyId?: number;

  @ApiPropertyOptional({ description: 'ID del CRS' })
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numPena?: number;

  @ApiPropertyOptional({ description: 'ID del tipo de pena sustitutiva' })
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
    description: 'Fecha de recepción en CRS (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaRecepcionCrs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  diasCondena?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  diasAbono?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  diasMonitoreo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ejecutoriada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  plazoMonitoreoDias?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de monitoreo (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaInicioMonitoreo?: string;

  @ApiPropertyOptional({
    description: 'Fecha de término anterior para prórrogas (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaTerminoAnterior?: string;

  @ApiPropertyOptional({
    description: 'Fecha de término nueva para prórrogas (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fechaTerminoNueva?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  victimaConsentimiento?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
