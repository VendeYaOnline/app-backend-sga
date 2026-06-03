import { IsOptional, IsInt } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Filtrar por tipo de evento ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;
}
