import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindSolicitudDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['createdAt', 'updatedAt', 'estadoAt', 'rucCausa', 'ritCausa'],
    default: 'estadoAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
  @ApiPropertyOptional({ description: 'Filtrar por ID de solicitud' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de estado actual' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por RUC de la causa' })
  @IsOptional()
  @IsString()
  rucCausa?: string;

  @ApiPropertyOptional({ description: 'Filtrar por RIT de la causa' })
  @IsOptional()
  @IsString()
  ritCausa?: string;

  @ApiPropertyOptional({ description: 'Filtrar por condenado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por CRS' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por usuario asignado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  asignadaA?: number;

  @ApiPropertyOptional({ description: 'Filtrar por origen de creación' })
  @IsOptional()
  @IsString()
  origenCreacion?: string;

  @ApiPropertyOptional({ description: 'Buscar por nombres del condenado (búsqueda parcial)' })
  @IsOptional()
  @IsString()
  nombresCondenado?: string;

  @ApiPropertyOptional({ description: 'Buscar por RUN del condenado' })
  @IsOptional()
  @IsString()
  runCondenado?: string;

  @ApiPropertyOptional({ description: 'Filtrar desde fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Filtrar hasta fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
