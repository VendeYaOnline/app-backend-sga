import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsIn,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCambioDomicilioDto {
  @ApiProperty({
    description: 'ID de la solicitud a la que pertenece el evento',
  })
  @IsInt()
  solicitudId: number;

  @ApiPropertyOptional({
    description: 'Subtipo del cambio de domicilio',
    enum: ['SIFT', 'IFT_PLUS'],
  })
  @IsOptional()
  @IsIn(['SIFT', 'IFT_PLUS'])
  subtipoCambio?: string;

  @ApiPropertyOptional({
    description:
      'Evaluación preliminar de factibilidad (la definitiva queda en SOLICITUD_FACTIBILIDAD)',
    enum: ['FACTIBLE', 'NO_FACTIBLE', 'NO_RECOMENDABLE'],
  })
  @IsOptional()
  @IsIn(['FACTIBLE', 'NO_FACTIBLE', 'NO_RECOMENDABLE'])
  factibilidadCd?: string;

  @ApiPropertyOptional({
    description:
      'ID del motivo de no factibilidad (FK a CAT_MOTIVO_NO_FACTIBLE)',
  })
  @IsOptional()
  @IsInt()
  motivoNoFactibleId?: number;

  @ApiPropertyOptional({
    description: 'Indica si se solicita revalidar el cambio de domicilio',
  })
  @IsOptional()
  @IsBoolean()
  revalidar?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha del evento (YYYY-MM-DD). Por defecto, fecha actual.',
  })
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional({ description: 'Observaciones del evento' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
