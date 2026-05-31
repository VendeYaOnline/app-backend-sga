import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSolicitudVictimaDto {
  @ApiProperty({ description: 'ID de la víctima a vincular' })
  @IsInt()
  victimaId: number;

  @ApiPropertyOptional({ description: 'Radio de prohibición en metros' })
  @IsOptional()
  @IsInt()
  @Min(1)
  radioProhibicionMetros?: number;
}
