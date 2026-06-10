import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindUsuarioDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre, username, email o RUT',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por activo/inactivo' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por rol' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rolId?: number;
}
