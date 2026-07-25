import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JWT_ACCESS_EXP, JWT_REFRESH_EXP } from 'src/shared/constants/jwt.constant';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Tìm user theo email (gọi qua UsersService)
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = { sub: user._id, email: user.email };

    // 4. Ký token (Kịch bản thực tế sẽ sinh cả Access Token và Refresh Token)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access_secret_key',
      expiresIn: JWT_ACCESS_EXP,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      expiresIn: JWT_REFRESH_EXP,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
      },
      accessToken,
      refreshToken,
    };
  }
}
