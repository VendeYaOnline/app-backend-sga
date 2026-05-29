import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVictimaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esExtranjero?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoIdentificacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  rutVictima?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pasaporteVictima?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoPaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sexoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailVictima?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  datoReservado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentimiento?: boolean;
}
