import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResolucionDto {
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
