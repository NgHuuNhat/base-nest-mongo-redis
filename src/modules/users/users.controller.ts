import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetUsersQueryDto } from './dto/get-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAllUsers(query);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.usersService.registerUser(body);
  }
}
