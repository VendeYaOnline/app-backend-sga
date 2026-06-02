import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSolicitanteDto {
  @ApiPropertyOptional({ description: 'Rol: FISCAL, DEFENSOR, JUEZ, TRIBUNAL, GENDARMERIA, OTRO' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  rolSolicitante?: string;

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
  @MaxLength(20)
  runSolicitante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailSolicitante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
