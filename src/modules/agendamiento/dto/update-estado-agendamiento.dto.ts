import { IsString, IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEstadoAgendamientoDto {
  @ApiProperty({
    enum: ['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'],
  })
  @IsString()
  @IsIn(['EN_PROCESO', 'NO_REALIZADO', 'COMPLETADO', 'CANCELADO'])
  estadoAgenda: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  comunaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;
}
