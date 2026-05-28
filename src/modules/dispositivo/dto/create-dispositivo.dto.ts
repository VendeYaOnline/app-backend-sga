import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDispositivoDto {
  @ApiProperty()
  @IsInt()
  tipoAccesorioId: number;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  numeroSerie: string;
}
