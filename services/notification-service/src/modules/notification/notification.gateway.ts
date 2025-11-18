import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private redisService: RedisService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user ID from auth token or query params
      const userId = client.handshake.auth?.userId || client.handshake.query?.userId as string;

      if (!userId) {
        console.log('❌ Connection rejected: No user ID provided');
        client.disconnect();
        return;
      }

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${userId}`);

      // Store connection in Redis for multi-instance support
      await this.redisService.set(
        `socket:${client.id}`,
        { userId, connectedAt: new Date().toISOString() },
        3600, // 1 hour TTL
      );

      console.log(`✅ User ${userId} connected (socket: ${client.id})`);
      console.log(`📊 Active connections: ${this.server.sockets.sockets.size}`);

      // Send connection success event
      client.emit('connected', {
        message: 'Successfully connected to notification server',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const connectionData = await this.redisService.get<{ userId: string }>(
        `socket:${client.id}`,
      );

      if (connectionData?.userId) {
        const userId = connectionData.userId;
        const userConnections = this.userSockets.get(userId);

        if (userConnections) {
          userConnections.delete(client.id);
          if (userConnections.size === 0) {
            this.userSockets.delete(userId);
          }
        }

        console.log(`👋 User ${userId} disconnected (socket: ${client.id})`);
      }

      // Clean up Redis
      await this.redisService.delete(`socket:${client.id}`);
      console.log(`📊 Active connections: ${this.server.sockets.sockets.size}`);
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    console.log(`🚪 Socket ${client.id} joined room: ${data.room}`);
    return { event: 'room-joined', data: { room: data.room } };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    console.log(`🚪 Socket ${client.id} left room: ${data.room}`);
    return { event: 'room-left', data: { room: data.room } };
  }

  // Send notification to specific user
  async sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    console.log(`📨 Sent '${event}' to user ${userId}`);
  }

  // Send notification to specific room
  async sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    console.log(`📨 Sent '${event}' to room ${room}`);
  }

  // Broadcast to all connected clients
  async broadcast(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`📢 Broadcast '${event}' to all clients`);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get online user count
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }

  // Get total connection count
  getTotalConnectionCount(): number {
    return this.server.sockets.sockets.size;
  }
}
