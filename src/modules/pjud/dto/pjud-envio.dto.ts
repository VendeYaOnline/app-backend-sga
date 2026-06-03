import { ApiPropertyOptional } from '@nestjs/swagger';

export class PjudEnvioDto {
  @ApiPropertyOptional()
  solicitudId?: number;

  @ApiPropertyOptional()
  datos?: any;
}
