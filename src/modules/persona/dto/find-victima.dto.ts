import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindVictimaDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por nombres, apellidos o RUN' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por RUN de la victima' })
  @IsOptional()
  @IsString()
  runVictima?: string;
}
