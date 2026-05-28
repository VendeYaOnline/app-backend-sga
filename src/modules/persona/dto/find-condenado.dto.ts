import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindCondenadoDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por RUT, nombre o apellido' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rutCondenado?: string;

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
