import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateZonaDto {
  @ApiProperty()
  @IsInt()
  tipoZonaId: number;

  @ApiProperty()
  @IsInt()
  regionId: number;

  @ApiProperty()
  @IsInt()
  comunaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreCalle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDireccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroRuta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  poblacion?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  radioMetros: number;

  @ApiPropertyOptional()
  @IsOptional()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esReservada?: boolean;

  @ApiPropertyOptional({
    description: 'ID del tipo de lugar (CASA, APARTAMENTO, etc.)',
  })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;
}

export class CreateSolicitudDto {
  @ApiProperty({ description: 'ID del tipo de causa (RUC_RIT o ROL)' })
  @IsInt()
  tipoCausaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rucCausa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ritCausa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rolCausa?: string;

  @ApiProperty()
  @IsInt()
  tribunalId: number;

  @ApiProperty()
  @IsInt()
  condenadoId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoLeyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoPenaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  medidaControlId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoHorarioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoDiaInicioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoDiaTerminoId?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  conBeacon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ type: [CreateZonaDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CreateZonaDto)
  zonas?: CreateZonaDto[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  delitoIds?: number[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  victimas?: { victimaId: number; radioProhibicionMetros?: number }[];
}
