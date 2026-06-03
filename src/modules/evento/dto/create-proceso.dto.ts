import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProcesoDto {
  @ApiProperty({
    description: 'ID del agendamiento asociado (FK a AGENDAMIENTO)',
  })
  @IsInt()
  @IsNotEmpty()
  agendamientoId: number;

  @ApiPropertyOptional({
    description: 'ID del técnico asignado (FK a USUARIO)',
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

  @ApiPropertyOptional({ description: 'ID de la región' })
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({ description: 'ID de la comuna' })
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional({
    description: 'Dirección donde se ejecuta el proceso',
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
    description: 'Fecha y hora real de ejecución del proceso (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  fechaEjecucion?: string;

  @ApiPropertyOptional({
    description: 'Número de intento (1 para el primero)',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroIntento?: number;

  @ApiPropertyOptional({ description: 'Hora de llegada al lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaLlegada?: string;

  @ApiPropertyOptional({ description: 'Hora de salida del lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaSalida?: string;

  @ApiPropertyOptional({
    description: 'Indica si el proceso fue realizado exitosamente',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean | undefined;
  })
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

  @ApiPropertyOptional({
    description: 'Notas adicionales del técnico sobre el proceso',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}
