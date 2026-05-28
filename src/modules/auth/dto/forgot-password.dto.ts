import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jperez@sga.cl' })
  @IsString()
  @IsNotEmpty()
  email: string;
}
