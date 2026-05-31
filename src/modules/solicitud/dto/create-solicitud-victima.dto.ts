import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSolicitudVictimaDto {
  @ApiPropertyOptional({
    description:
      'ID de víctima existente. Si no se envía, se crea una nueva con los datos proporcionados.',
  })
  @IsOptional()
  @IsInt()
  victimaId?: number;

  @ApiPropertyOptional({ description: 'Radio de prohibición en metros' })
  @IsOptional()
  @IsInt()
  @Min(1)
  radioProhibicionMetros?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  esExtranjero?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoIdentificacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  runVictima?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pasaporteVictima?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoPaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sexoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailVictima?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  datoReservado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentimiento?: boolean;
}
