import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecepcionDecretoDto {
  @ApiPropertyOptional()
  solicitudId?: number;
}
