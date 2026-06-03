import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePeriodoDto {
  @ApiProperty()
  @IsInt()
  anio: number;

  @ApiProperty()
  @IsInt()
  mes: number;
}

export class CreateDetalleDto {
  @ApiProperty()
  @IsInt()
  periodoId: number;

  @ApiProperty()
  @IsInt()
  solicitudId: number;
}
