import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcesoDispositivoDto {
  @ApiProperty()
  @IsInt()
  dispositivoId: number;

  @ApiProperty()
  @IsInt()
  rolDispositivoId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
