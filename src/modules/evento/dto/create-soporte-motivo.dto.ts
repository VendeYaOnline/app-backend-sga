import { IsInt, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSoporteMotivoDto {
  @ApiProperty({
    description: 'ID del tipo de problema (FK a CAT_TIPO_PROBLEMA_ST)',
  })
  @IsInt()
  tipoProblemaId: number;

  @ApiPropertyOptional({
    description:
      'Momento en que se registra: AGENDAMIENTO (coordinador) o EJECUCION (técnico)',
    enum: ['AGENDAMIENTO', 'EJECUCION'],
    default: 'AGENDAMIENTO',
  })
  @IsOptional()
  @IsIn(['AGENDAMIENTO', 'EJECUCION'])
  momento?: string;

  @ApiPropertyOptional({
    description: 'Observación específica del problema',
    maxLength: 500,
  })
  @IsOptional()
  @MaxLength(500)
  observacion?: string;
}
