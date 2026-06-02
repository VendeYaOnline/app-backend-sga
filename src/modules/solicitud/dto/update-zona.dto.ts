import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateZonaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoZonaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  comunaId?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPostal?: string;

  @ApiPropertyOptional({ description: 'ID del tipo de lugar (CASA, APARTAMENTO, etc.)' })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  radioMetros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  urlMapa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esReservada?: boolean;
}
