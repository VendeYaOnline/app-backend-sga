import { IsInt, IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PjudEnvioDto {
  @ApiPropertyOptional({ description: 'ID de la solicitud asociada' })
  @IsOptional()
  @IsInt()
  solicitudId?: number;

  @ApiPropertyOptional({ description: 'Payload adicional para enviar a PJUD' })
  @IsOptional()
  @IsObject()
  datos?: Record<string, unknown>;
}
