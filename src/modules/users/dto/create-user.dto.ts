import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Nguyen Huu Nhat' })
    @IsString({ message: 'Invalid string' })
    @IsNotEmpty({ message: 'Required' })
    full_name: string;

    @ApiProperty({ example: 'nhat200901@gmail.com' })
    @IsEmail({}, { message: 'Invalid email' })
    @IsString({ message: 'Invalid string' })
    @IsNotEmpty({ message: 'Required' })
    email: string;

    @ApiProperty({ example: 'Admin123@' })
    @IsNotEmpty({ message: 'Required' })
    @IsString({ message: 'Invalid string' })
    password: string;

    @ApiProperty({ example: '0985627061' })
    @IsString({ message: 'Invalid string' })
    @IsNotEmpty({ message: 'Required' })
    phone: string;

    @ApiProperty({ example: 'USER' })
    @IsString({ message: 'Invalid string' })
    @IsNotEmpty({ message: 'Required' })
    role: string;

}
