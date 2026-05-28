import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateProcesoAccesorioDto {
  @IsInt()
  tipoAccesorioId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
