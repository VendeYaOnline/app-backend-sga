import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventoDto {
  @ApiProperty()
  @IsInt()
  tipoEventoId: number;

  @ApiProperty()
  @IsInt()
  solicitudId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origenCreacion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
