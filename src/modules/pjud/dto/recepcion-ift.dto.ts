import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecepcionIftDto {
  @ApiProperty()
  crrIdSolicitud: any;
}
