import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'jperez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'jperez@sga.cl' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  run: string;

  @ApiProperty({ example: 'MiPassword123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoPaterno: string;

  @ApiPropertyOptional({ example: 'González' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string;

  @ApiPropertyOptional({ example: '56912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoMovil?: string;

  @ApiPropertyOptional({ example: '022123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoFijo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tribunalId?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  debeCambiarPass?: boolean;
}
