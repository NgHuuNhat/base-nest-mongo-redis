import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/core/cache/redis/redis.service';
import { GatewayService } from './gateway.service';

@WebSocketGateway(8080, { cors: { origin: '*' } })
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('GatewayService');
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Giả sử bạn lấy userId từ token sau khi đã qua bước Auth
      const token = client.handshake.headers?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }
      const userId = (await this.jwtService.decode(token).sub) as string;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      // Lưu mối quan hệ vào Redis
      await this.redisService.addConnection(userId, client.id);

      // Lưu tạm userId vào instance của socket để lúc disconnect lấy ra dùng luôn, đỡ phải parse lại token
      client.data.userId = userId;

      this.logger.debug(`User ${userId} kết nối thiết bị mới: ${client.id}`);
    } catch (error) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId as string;
    if (userId) {
      // Xóa socketId này khỏi Set trong Redis
      await this.redisService.removeConnection(userId, client.id);
      this.logger.debug(`User ${userId} ngắt kết nối thiết bị: ${client.id}`);
    }
  }
}
