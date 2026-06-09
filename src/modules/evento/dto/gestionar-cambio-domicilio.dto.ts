import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateZonaDto } from '../../solicitud/dto/create-solicitud.dto';

export class GestionarCambioDomicilioDto {
  @ApiProperty({
    description: 'Nuevas zonas del domicilio. Deben ser las zonas del nuevo domicilio, no las de la solicitud original.',
    type: [CreateZonaDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateZonaDto)
  zonas: CreateZonaDto[];
}
