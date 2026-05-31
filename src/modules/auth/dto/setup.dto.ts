import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupDto {
  @ApiProperty({
    description: 'Token secreto de inicialización configurado en el servidor',
  })
  @IsString()
  @IsNotEmpty()
  setupSecret: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'admin@sga.cl' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({ example: 'SGA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoPaterno: string;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  run: string;
}
