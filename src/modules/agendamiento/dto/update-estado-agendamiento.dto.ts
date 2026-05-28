import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoAgendamientoDto {
  @ApiProperty({ enum: ['PROGRAMADO', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'] })
  @IsString()
  @IsIn(['PROGRAMADO', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'])
  estadoAgenda: string;
}
