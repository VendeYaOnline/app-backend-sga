import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSolicitudDelitoSimpleDto {
  @ApiProperty({ description: 'ID del delito a asociar' })
  @IsInt()
  @IsNotEmpty()
  delitoId: number;
}
