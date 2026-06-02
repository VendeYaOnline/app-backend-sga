import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProcesoInlineDto } from './create-evento-completo.dto';

export class CreateEventoConProcesoDto {
  @ApiProperty({
    description:
      'ID del tipo de evento (FK a CAT_TIPO_EVENTO). Debe ser de categoria Proceso: INSTALACION, DESINSTALACION o SOPORTE.',
  })
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

  @ApiProperty({
    description:
      'Datos del proceso en terreno (instalacion, desinstalacion, soporte). Incluye opcionalmente datos de agendamiento.',
  })
  @ValidateNested()
  @Type(() => CreateProcesoInlineDto)
  proceso: CreateProcesoInlineDto;
}
