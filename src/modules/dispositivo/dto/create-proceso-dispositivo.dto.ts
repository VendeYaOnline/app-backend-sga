import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProcesoDispositivoDto {
  @IsInt()
  dispositivoId: number;

  @IsInt()
  rolDispositivoId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
