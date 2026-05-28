import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

export class CreateDispositivoDto {
  @IsInt()
  tipoAccesorioId: number;

  @IsString()
  @MaxLength(100)
  numeroSerie: string;
}
