import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindCargaLaboralDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha de termino (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ description: 'Filtrar por usuario' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuarioId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de accion' })
  @IsOptional()
  @IsString()
  tipoAccion?: string;
}
