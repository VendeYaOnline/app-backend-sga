import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PjudEnvioDto {
  @ApiPropertyOptional()
  solicitudId?: number;

  @ApiPropertyOptional()
  datos?: any;
}
