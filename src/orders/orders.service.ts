import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from './orders.gateway';
import { OrderStatus } from '@prisma/client';
import { ClaimOrderDto } from './dto/claim-order.dto';
import { SyncQrCodeDto } from './dto/sync-qr-code.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) {}

  // --- 顾客端方法 ---

  async createOrderForCustomer(createOrderDto: CreateOrderDto) {
    const { merchantId, tableId, items, storeName, storeAddress } = createOrderDto;

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        merchantId: merchantId,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException(
        '一个或多个菜单项不存在或不属于该商户。',
      );
    }

    const totalPrice = items.reduce((total, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(
          `在计算总价时未找到ID为 ${item.menuItemId} 的菜单项。`,
        );
      }
      return total + menuItem.price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        totalPrice,
        storeName,
        storeAddress,
        status: OrderStatus.AWAITING_PAYMENT, // 新订单状态为待支付
        merchant: {
          connect: { id: merchantId },
        },
        table: {
          connect: { id: tableId },
        },
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            menuItem: {
              connect: { id: item.menuItemId },
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // 通过WebSocket通知商户端有新订单
    this.ordersGateway.sendNewOrderToMerchant(merchantId, order);
    return order;
  }

  async getOrderByIdForCustomer(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`未找到ID为 ${id} 的订单。`);
    }
    return order;
  }

  async getClaimDetails(id: number) {
    const order = await this.getOrderByIdForCustomer(id);
    const claimCode = order.id.toString().slice(-4).padStart(4, '0');
    const qrCodeData = JSON.stringify({
      orderId: order.id,
      claimCode: claimCode,
      timestamp: Date.now(),
    });
    return { claimCode, qrCodeData };
  }

  // --- 商户端方法 ---

  async getOrdersByMerchant(merchantId: number) {
    return this.prisma.order.findMany({
      where: { merchantId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // 广播订单状态更新
    this.ordersGateway.broadcastOrderStatusUpdate(updatedOrder);
    return updatedOrder;
  }

  // TODO: 实现具体的取餐和同步逻辑
  async claimOrder(orderId: number, claimOrderDto: ClaimOrderDto) {
    console.log('claimOrder called with:', orderId, claimOrderDto);
    return { success: true, message: '订单核销成功 (功能待实现)' };
  }

  async syncQrCode(orderId: number, syncQrCodeDto: SyncQrCodeDto) {
    console.log('syncQrCode called with:', orderId, syncQrCodeDto);
    return { success: true, message: '二维码同步成功 (功能待实现)' };
  }

  // --- 别名，用于兼容旧的或通用的 Controller ---

  async create(createOrderDto: CreateOrderDto) {
    return this.createOrderForCustomer(createOrderDto);
  }

  async findOne(id: number) {
    return this.getOrderByIdForCustomer(id);
  }

  async findAllForMerchant(merchantId: number) {
    return this.getOrdersByMerchant(merchantId);
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    return this.updateOrderStatus(orderId, status);
  }

  async simulatePayment(orderId: number) {
    const order = await this.getOrderByIdForCustomer(orderId);
    if (order.status !== 'AWAITING_PAYMENT') {
      return order;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.RECEIVED },
    });

    this.ordersGateway.sendNewOrderToMerchant(updatedOrder.merchantId, updatedOrder);
    return updatedOrder;
  }
}