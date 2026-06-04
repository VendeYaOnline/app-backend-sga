import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProcesoDispositivoDto } from '../../dispositivo/dto/create-proceso-dispositivo.dto';

export class UpdateProcesoAgendamientoDto {
  @ApiPropertyOptional({ description: 'Hora de llegada al lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaLlegada?: string;

  @ApiPropertyOptional({ description: 'Hora de salida del lugar (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  horaSalida?: string;

  @ApiPropertyOptional({
    type: [CreateProcesoDispositivoDto],
    description:
      'Dispositivos a asociar al proceso. Se eliminan los existentes y se crean los nuevos (reemplazo completo).',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcesoDispositivoDto)
  dispositivos?: CreateProcesoDispositivoDto[];
}
