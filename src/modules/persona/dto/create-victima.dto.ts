import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVictimaDto {
  @ApiPropertyOptional({ default: false })
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoPaterno: string;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  datoReservado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentimiento?: boolean;
}
