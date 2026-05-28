import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRolDto {
  @ApiPropertyOptional({ example: 'Coordinador General' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreRol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcionRol?: string;
}
