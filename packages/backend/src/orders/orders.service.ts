import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto'; // 导入新的 DTO
import { OrdersGateway } from './orders.gateway';
import { OrderStatus, Order } from '@prisma/client';
import { ClaimOrderDto } from './dto/claim-order.dto';
import { SyncQrCodeDto } from './dto/sync-qr-code.dto';

// 扩展Prisma生成的Order类型，以包含关联数据
type OrderWithItems = Order & {
  items: { menuItem: any }[];
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) { }

  /**
   * 格式化订单响应，将 assigneeId 和 assigneeName 转换为嵌套对象。
   * @param order - 从Prisma查询到的订单对象
   * @returns 格式化后的订单对象，可安全地返回给客户端
   */
  private _formatOrderResponse(order: OrderWithItems | null) {
    if (!order) {
      return null;
    }
    const { assigneeId, assigneeName, ...rest } = order;
    const response: any = { ...rest };

    if (assigneeId !== null && assigneeName !== null) {
      response.assignee = {
        id: assigneeId,
        name: assigneeName,
      };
    }
    return response;
  }

  // --- 顾客端方法 ---

  async createOrderForCustomer(
    createOrderDto: CreateOrderDto | CreateCustomerOrderDto, // 使用联合类型
    merchantId: number,
    sessionId?: string, // 改为可选
  ) {
    const { items, storeName, storeAddress } = createOrderDto;
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        merchantId: merchantId,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('一个或多个菜单项不存在或不属于该商户。');
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

    // 规范化 items.create，确保 selectedSpecifications 为对象（非数组/非 null）
    const itemsCreate = items.map((item) => ({
      quantity: item.quantity,
      selectedSpecifications:
        item.selectedSpecifications && typeof item.selectedSpecifications === 'object' && !Array.isArray(item.selectedSpecifications)
          ? item.selectedSpecifications
          : {},
      menuItem: {
        connect: { id: item.menuItemId },
      },
    }));

    // 构造 data 对象，条件性加入 sessionId，避免传入 undefined 导致 Prisma 报错
    const data: any = {
      totalPrice,
      storeName,
      storeAddress,
      status: OrderStatus.RECEIVED,
      merchant: {
        connect: { id: merchantId },
      },
      items: {
        create: itemsCreate,
      },
    };

    if (typeof sessionId === 'string' && sessionId.length > 0) {
      data.sessionId = sessionId;
    }

    const order = await this.prisma.order.create({
      data,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const formattedOrder = this._formatOrderResponse(order);
    this.ordersGateway.sendNewOrderToMerchant(merchantId, formattedOrder);
    return formattedOrder;
  }

  async findActiveOrderBySession(merchantId: number, sessionId: string) {
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        merchantId,
        sessionId,
        status: {
          in: [OrderStatus.RECEIVED, OrderStatus.PREPARING],
        },
      },
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

    return this._formatOrderResponse(activeOrder);
  }

  async getOrderByIdForCustomer(id: number, sessionId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        sessionId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(
        `未找到ID为 ${id} 的订单，或该订单不属于当前会话。`,
      );
    }
    return this._formatOrderResponse(order);
  }

  async getClaimDetails(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order || !order.claimCode || !order.qrCodeData) {
      throw new NotFoundException(`未找到ID为 ${id} 的订单的取餐详情。`);
    }

    return {
      claimCode: order.claimCode,
      qrCodeData: order.qrCodeData
    };
  }

  // --- 商户端方法 ---

  async getOrdersByMerchant(merchantId: number) {
    const orders = await this.prisma.order.findMany({
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
    return orders.map(order => this._formatOrderResponse(order));
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const formattedOrder = this._formatOrderResponse(updatedOrder);
    this.ordersGateway.broadcastOrderStatusUpdate(formattedOrder);
    return formattedOrder;
  }

  async claimOrder(orderId: number, claimOrderDto: ClaimOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`未找到ID为 ${orderId} 的订单。`);
    }

    if (order.status !== OrderStatus.RECEIVED) {
      throw new ConflictException(
        `无法接单，订单当前状态为 "${order.status}"，而不是 "RECEIVED"。`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PREPARING,
        assigneeId: claimOrderDto.assignee.id,
        assigneeName: claimOrderDto.assignee.name,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const formattedOrder = this._formatOrderResponse(updatedOrder);
    this.ordersGateway.broadcastOrderStatusUpdate(formattedOrder);
    return formattedOrder;
  }

  async syncQrCode(orderId: number, syncQrCodeDto: SyncQrCodeDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`未找到ID为 ${orderId} 的订单。`);
    }

    if (order.status !== OrderStatus.PREPARING) {
      throw new ConflictException(
        `无法完成订单，订单当前状态为 "${order.status}"，而不是 "PREPARING"。`,
      );
    }

    // 1. 保存二维码信息到数据库并更新状态
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        claimCode: syncQrCodeDto.claimCode,
        qrCodeData: syncQrCodeDto.qrCodeData,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // 2. 广播订单状态和二维码信息的更新
    const formattedOrder = this._formatOrderResponse(updatedOrder);
    this.ordersGateway.broadcastOrderStatusUpdate(formattedOrder); // 广播状态为COMPLETED
    this.ordersGateway.broadcastQrCodeUpdate(orderId, { // 广播二维码信息
      claimCode: syncQrCodeDto.claimCode,
      qrCodeData: syncQrCodeDto.qrCodeData,
    });

    return formattedOrder;
  }

  // --- 别名，用于兼容旧的或通用的 Controller ---

  async create(createOrderDto: CreateOrderDto, merchantId: number, sessionId: string) {
    return this.createOrderForCustomer(createOrderDto, merchantId, sessionId);
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
      throw new NotFoundException(`未找到ID为 ${id} 的订单。`);
    }
    return this._formatOrderResponse(order);
  }

  async findAllForMerchant(merchantId: number) {
    return this.getOrdersByMerchant(merchantId);
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    return this.updateOrderStatus(orderId, status);
  }

  async simulatePayment(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`未找到ID为 ${orderId} 的订单。`);
    }
    // 订单流程已简化，不再有 AWAITING_PAYMENT 状态。
    // 此方法保留为空，以兼容可能存在的旧前端调用，但不再执行任何操作。
    return this._formatOrderResponse(order as OrderWithItems);
  }
}