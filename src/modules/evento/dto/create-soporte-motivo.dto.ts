import { IsInt, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSoporteMotivoDto {
  @ApiProperty({
    description: 'ID del tipo de problema (FK a CAT_TIPO_PROBLEMA_ST)',
  })
  @IsInt()
  tipoProblemaId: number;

  @ApiPropertyOptional({
    description: 'Si es el motivo principal del agendamiento',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esMotivoPrincipal?: boolean;

  @ApiPropertyOptional({
    description: 'Observación específica del problema',
    maxLength: 500,
  })
  @IsOptional()
  @MaxLength(500)
  observacion?: string;
}
