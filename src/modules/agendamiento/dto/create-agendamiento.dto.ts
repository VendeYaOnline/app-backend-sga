import { IsInt, IsDateString, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgendamientoDto {
  @ApiProperty()
  @IsInt()
  eventoId: number;

  @ApiProperty()
  @IsDateString()
  fechaAgendada: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paraCondenado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  paraVictimaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
