import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCondenadoDto {
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
  rutCondenado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pasaporte?: string;

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
  @IsString()
  @MaxLength(100)
  nombreSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sexoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  identidadGeneroId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailCondenado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoEmergenciaNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoEmergenciaApellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  contactoEmergenciaParentescoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactoEmergenciaTelefono?: string;
}
