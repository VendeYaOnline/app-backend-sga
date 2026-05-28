import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jperez' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'MiPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
