import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCondenadoDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  esExtranjero?: boolean;

  @ApiProperty()
  @IsInt()
  tipoIdentificacionId: number;

  @ApiPropertyOptional()
  @ValidateIf((o) => !o.esExtranjero)
  @IsNotEmpty({ message: 'El RUT del condenado es obligatorio para personas no extranjeras' })
  @IsString()
  @MaxLength(12)
  rutCondenado?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.esExtranjero === true)
  @IsNotEmpty({ message: 'El pasaporte es obligatorio para personas extranjeras' })
  @IsString()
  @MaxLength(50)
  pasaporte?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoPaterno: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombreSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sexoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  identidadGeneroId?: number;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailCondenado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoEmergenciaNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoEmergenciaApellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  contactoEmergenciaParentescoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactoEmergenciaTelefono?: string;
}
