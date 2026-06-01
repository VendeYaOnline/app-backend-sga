import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoAgendamientoDto {
  @ApiProperty({
    enum: ['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'],
  })
  @IsString()
  @IsIn(['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'])
  estadoAgenda: string;
}
