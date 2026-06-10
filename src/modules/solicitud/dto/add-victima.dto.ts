import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddVictimaDto {
  @ApiProperty({ description: 'ID de la víctima existente' })
  @IsInt()
  victimaId: number;

  @ApiPropertyOptional({ description: 'Radio de prohibición en metros' })
  @IsOptional()
  @IsInt()
  @Min(1)
  radioProhibicionMetros?: number;
}
