import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFactibilidadDto {
  @ApiProperty({ description: 'ID del tipo de factibilidad (CAT_TIPO_FACTIBILIDAD)' })
  @IsInt()
  @IsNotEmpty()
  tipoFactibilidadId: number;

  @ApiPropertyOptional({ description: 'ID del motivo de no factibilidad (obligatorio si el tipo requiere motivo)' })
  @IsOptional()
  @IsInt()
  motivoNoFactibleId?: number;
}
