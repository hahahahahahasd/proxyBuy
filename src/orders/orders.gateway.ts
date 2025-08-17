import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for demo purposes
  },
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('OrdersGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMerchantRoom')
  handleJoinMerchantRoom(client: Socket, payload: { merchantId: number }): void {
    const room = `merchant-${payload.merchantId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }
  
  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(client: Socket, payload: { orderId: number }): void {
    const room = `order-${payload.orderId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  sendNewOrderToMerchant(merchantId: number, order: any) {
    const room = `merchant-${merchantId}`;
    this.server.to(room).emit('newOrder', order);
    this.logger.log(`Emitted 'newOrder' to room ${room} with order ID ${order.id}`);
  }

  broadcastOrderStatusUpdate(order: any) {
    const merchantRoom = `merchant-${order.merchantId}`;
    const orderRoom = `order-${order.id}`;
    // Emit to both rooms
    this.server.to(merchantRoom).to(orderRoom).emit('orderStatusUpdate', order);
    this.logger.log(`Emitted 'orderStatusUpdate' for order ${order.id} to rooms ${merchantRoom} and ${orderRoom}`);
  }
}
