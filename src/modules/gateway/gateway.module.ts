import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayGateway } from './gateway.gateway';
import { GatewayService } from './gateway.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET })],
  providers: [GatewayGateway, GatewayService],
})
export class GatewayModule {}
