import { IsOptional, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindProcesoDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por CRS ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por técnico ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por destinatario del proceso',
    enum: ['CONDENADO', 'VICTIMA'],
  })
  @IsOptional()
  @IsIn(['CONDENADO', 'VICTIMA'])
  paraQuien?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de evento ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por condenado ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por víctima ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  victimaId?: number;
}
