import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindUsuariosRolDto {
  @ApiProperty({
    description: 'Código del rol a filtrar',
    enum: ['DMT', 'EMPRESA', 'COORDINADOR', 'TECNICO'],
    example: 'DMT',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['DMT', 'EMPRESA', 'COORDINADOR', 'TECNICO'])
  rol: string;
}
