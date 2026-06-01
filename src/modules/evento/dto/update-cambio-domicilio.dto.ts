import { IsInt, IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCambioDomicilioDto {
  @ApiPropertyOptional({
    description: 'Subtipo del cambio de domicilio',
    enum: ['SIFT', 'IFT_PLUS'],
  })
  @IsOptional()
  @IsIn(['SIFT', 'IFT_PLUS'])
  subtipoCambio?: string;

  @ApiPropertyOptional({
    description: 'Resultado de factibilidad del cambio de domicilio',
    enum: ['FACTIBLE', 'NO_FACTIBLE', 'NO_RECOMENDABLE'],
  })
  @IsOptional()
  @IsIn(['FACTIBLE', 'NO_FACTIBLE', 'NO_RECOMENDABLE'])
  factibilidadCd?: string;

  @ApiPropertyOptional({
    description:
      'ID del motivo de no factibilidad (FK a CAT_MOTIVO_NO_FACTIBLE)',
  })
  @IsOptional()
  @IsInt()
  motivoNoFactibleId?: number;

  @ApiPropertyOptional({ description: 'Indica si se debe revalidar' })
  @IsOptional()
  @IsBoolean()
  revalidar?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el cambio fue visto/revisado',
  })
  @IsOptional()
  @IsBoolean()
  visto?: boolean;
}
