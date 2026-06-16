import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadArchivoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entidad: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  entidadId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  propositoId: number;
}
