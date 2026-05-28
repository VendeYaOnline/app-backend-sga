import { IsInt, IsDateString, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgendamientoDto {
  @IsInt()
  eventoId: number;

  @IsDateString()
  fechaAgendada: string;

  @IsOptional()
  @IsInt()
  asignadoA?: number;

  @IsOptional()
  @IsInt()
  crsId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionAgenda?: string;

  @IsOptional()
  @IsBoolean()
  paraCondenado?: boolean;

  @IsOptional()
  @IsInt()
  paraVictimaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
