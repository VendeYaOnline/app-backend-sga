import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindCondenadoDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por RUN, nombre o apellido' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  runCondenado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pasaporte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  crsId?: number;
}
