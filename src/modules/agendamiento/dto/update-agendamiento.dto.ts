import { IsOptional, IsDateString, IsInt, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAgendamientoDto {
  @IsOptional()
  @IsDateString()
  fechaAgendada?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  asignadoA?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  crsId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @IsOptional()
  @IsInt()
  paraVictimaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
