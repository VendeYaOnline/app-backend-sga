import { IsString, IsInt, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlantillaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  codigo: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiProperty()
  @IsString()
  mensajePlantilla: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  eventoDisparador: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  entidadOrigen: string;

  @ApiProperty()
  @IsInt()
  rolId: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enviaApp?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enviaCorreo?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdatePlantillaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mensajePlantilla?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  eventoDisparador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entidadOrigen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  rolId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enviaApp?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enviaCorreo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
