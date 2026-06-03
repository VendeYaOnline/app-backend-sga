import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoEvento } from '../enums/evento.enum';

const ESTADOS_AGENDA = [
  'EN_PROCESO',
  'NO_REALIZADO',
  'COMPLETADO',
  'CANCELADO',
] as const;

export class FinalizarEventoDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado del evento',
    enum: Object.values(EstadoEvento),
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoEvento))
  estadoEvento?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado del agendamiento asociado al proceso',
    enum: ESTADOS_AGENDA,
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_AGENDA)
  estadoAgenda?: string;

  @ApiPropertyOptional({
    description: 'Indica si el proceso fue realizado exitosamente',
  })
  @IsOptional()
  @IsBoolean()
  realizado?: boolean;

  @ApiPropertyOptional({
    description:
      'ID del motivo por el cual no se realizó el proceso (FK a CAT_MOTIVO_NO_REALIZADO)',
  })
  @IsOptional()
  @IsInt()
  motivoNoRealizadoId?: number;

  @ApiPropertyOptional({
    description: 'Detalle adicional de por qué no se realizó el proceso',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalleNoRealizado?: string;
}
