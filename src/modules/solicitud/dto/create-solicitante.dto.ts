import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSolicitanteDto {
  @ApiProperty({
    description: 'Rol: FISCAL, DEFENSOR, JUEZ, TRIBUNAL, GENDARMERIA, OTRO',
  })
  @IsString()
  @MaxLength(30)
  rolSolicitante: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  nombres: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  apellidoPaterno: string;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
