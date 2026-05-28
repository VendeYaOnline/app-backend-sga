import { IsString, IsIn } from 'class-validator';

export class UpdateEstadoAgendamientoDto {
  @IsString()
  @IsIn(['PROGRAMADO', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'])
  estadoAgenda: string;
}
