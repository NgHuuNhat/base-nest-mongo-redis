import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'nguyenducduc@gmail.com' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsString({ message: 'Invalid string' })
  @IsNotEmpty({ message: 'Required' })
  email: string;

  @ApiProperty({ example: 'Nguyễn Đức Đức' })
  @IsString({ message: 'Invalid string' })
  @IsNotEmpty({ message: 'Required' })
  name: string;

  @ApiProperty({ example: 'Admin123@' })
  @IsNotEmpty({ message: 'Required' })
  @IsString({ message: 'Invalid string' })
  password: string;
}
