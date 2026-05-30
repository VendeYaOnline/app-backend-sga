import { IsInt, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransicionEstadoDto {
  @ApiProperty({ example: 2, description: 'ID del estado destino' })
  @IsInt()
  @IsNotEmpty()
  estadoNuevoId: number;

  @ApiPropertyOptional({ example: 'Cumple con todos los requisitos' })
  @IsOptional()
  @MaxLength(500)
  motivo?: string;
}
