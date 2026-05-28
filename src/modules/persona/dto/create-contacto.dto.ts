import { IsString, IsNotEmpty, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactoDto {
  @ApiProperty({ example: 'MOVIL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  tipoContacto: string;

  @ApiProperty({ example: '56912345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  valorContacto: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  esPrincipal: boolean;
}
