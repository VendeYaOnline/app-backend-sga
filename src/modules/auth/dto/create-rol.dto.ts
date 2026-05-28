import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'COORDINADOR' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @ApiProperty({ example: 'Coordinador General' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreRol: string;

  @ApiProperty({ example: 'Responsable de supervisar y gestionar solicitudes IFT', required: false })
  @IsString()
  @MaxLength(500)
  descripcionRol?: string;
}
