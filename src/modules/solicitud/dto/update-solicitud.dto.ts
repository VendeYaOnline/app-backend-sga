import { OmitType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSolicitudDto } from './create-solicitud.dto';
import { UpdateCondenadoDto } from '../../persona/dto/update-condenado.dto';

export class UpdateSolicitudDto extends PartialType(
  OmitType(CreateSolicitudDto, ['condenado', 'condenadoId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Datos del condenado a actualizar. Aplica sobre el condenado actualmente vinculado.',
    type: UpdateCondenadoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCondenadoDto)
  condenado?: UpdateCondenadoDto;
}
