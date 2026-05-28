import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  rolId: number;
}
