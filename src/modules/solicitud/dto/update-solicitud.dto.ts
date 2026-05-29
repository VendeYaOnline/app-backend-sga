import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSolicitudDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoCausaId?: number;

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
  @IsInt()
  tribunalId?: number;

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
  @IsString()
  horaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  conBeacon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
