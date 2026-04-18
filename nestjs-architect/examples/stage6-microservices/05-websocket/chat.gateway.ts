// ========== WebSocket 聊天网关 ==========

import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`);
  }

  @SubscribeMessage('chat:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; username: string }) {
    client.join(`room:${data.roomId}`);
    client.to(`room:${data.roomId}`).emit('chat:system', { message: `${data.username} 加入了房间` });
    return { event: 'chat:join', data: { success: true, roomId: data.roomId } };
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; username: string; content: string }) {
    this.server.to(`room:${data.roomId}`).emit('chat:message', {
      id: `${Date.now()}`,
      username: data.username,
      content: data.content,
      timestamp: new Date().toISOString(),
    });
    return { event: 'chat:message', data: { sent: true } };
  }

  @SubscribeMessage('chat:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; username: string }) {
    client.leave(`room:${data.roomId}`);
    client.to(`room:${data.roomId}`).emit('chat:system', { message: `${data.username} 离开了房间` });
    return { event: 'chat:leave', data: { success: true } };
  }
}
