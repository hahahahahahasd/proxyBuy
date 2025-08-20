import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from './orders.gateway';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const { merchantId, tableId, items } = createOrderDto;

    const menuItemIds = items.map((item) => item.menuItemId).filter((id) => id !== undefined && id !== null);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        merchantId: merchantId,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('One or more menu items not found or do not belong to this merchant.');
    }

    const totalPrice = items.reduce((total, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      // Although we've checked before, TypeScript compiler isn't aware of the context in reduce.
      if (!menuItem) {
        // This should theoretically not be reached due to the check above.
        throw new NotFoundException(`Menu item with id ${item.menuItemId} not found during price calculation.`);
      }
      return total + menuItem.price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        merchantId,
        tableId,
        totalPrice,
        status: OrderStatus.AWAITING_PAYMENT,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
    });

    return order;
  }

  async simulatePayment(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }
    if (order.status !== 'AWAITING_PAYMENT') {
      // Optional: handle cases where payment is attempted on an already processed order
      return order;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.RECEIVED },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    this.ordersGateway.sendNewOrderToMerchant(
      updatedOrder.merchantId,
      updatedOrder,
    );

    return updatedOrder;
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { // Include relations to broadcast the full order object
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      }
    });

    // Broadcast the update to all clients in the relevant rooms
    this.ordersGateway.broadcastOrderStatusUpdate(updatedOrder);

    return updatedOrder;
  }

  async findAllForMerchant(merchantId: number) {
    return this.prisma.order.findMany({
      where: { merchantId },
      include: {
        table: true,
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

  async findOne(id: number) {
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
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }
}
