import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransicionEstadoDto {
  @ApiProperty({ example: 'APROBADA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  estadoNuevo: string;

  @ApiPropertyOptional({ example: 'Cumple con todos los requisitos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
