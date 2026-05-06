import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server

  handleConnection(client: Socket) {
    client.emit('socket:ready', { id: client.id })
  }

  @SubscribeMessage('join:conversation')
  joinConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.join(conversationId)
  }

  @SubscribeMessage('join:user')
  joinUser(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(`user:${userId}`)
  }

  @SubscribeMessage('typing:start')
  typingStart(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string; userId: string }) {
    client.to(payload.conversationId).emit('typing:start', payload)
  }

  @SubscribeMessage('typing:stop')
  typingStop(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string; userId: string }) {
    client.to(payload.conversationId).emit('typing:stop', payload)
  }

  emitMessage(conversationId: string, message: unknown) {
    this.server.to(conversationId).emit('message:received', message)
  }

  emitFlaggedAlert(userId: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit('alert:flagged-message', payload)
  }
}
