import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcesoDispositivoDto {
  @ApiProperty()
  @IsInt()
  tipoAccesorioId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @ApiProperty()
  @IsInt()
  rolDispositivoId: number;

  @ApiPropertyOptional({
    description: 'Talla del dispositivo si aplica (ej: S/M/L/XL)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  talla?: string;

  @ApiPropertyOptional({
    description: 'Observaciones sobre el dispositivo',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({
    description:
      'Indica si fue entregado/recibido físicamente. NULL = no aplica',
  })
  @IsOptional()
  @IsBoolean()
  entregado?: boolean;
}

export class CreateProcesoDispositivosDto {
  @ApiProperty({ type: [CreateProcesoDispositivoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcesoDispositivoDto)
  dispositivos: CreateProcesoDispositivoDto[];
}
