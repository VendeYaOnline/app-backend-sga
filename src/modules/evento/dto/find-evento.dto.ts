import { IsOptional, IsInt, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindEventoDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por solicitud ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  solicitudId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de evento ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del evento (PENDIENTE, APROBADO, etc.)',
  })
  @IsOptional()
  @IsString()
  estadoEvento?: string;

  @ApiPropertyOptional({ description: 'Filtrar por usuario asignado ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  asignadoA?: number;
}
