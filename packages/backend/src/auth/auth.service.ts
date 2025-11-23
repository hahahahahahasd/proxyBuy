import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

// 定义JWT payload的接口
interface JwtPayload {
  merchantId: number;
  sessionId: string;
  type: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, // 1. 注入 PrismaService
  ) {}

  /**
   * 为顾客生成一个访问令牌
   * @param generateTokenDto 包含 merchantId 和 sessionId
   * @returns 返回生成的 accessToken
   */
  async generateCustomerToken(
    generateTokenDto: GenerateTokenDto,
  ): Promise<{ accessToken: string }> {
    const payload = {
      merchantId: generateTokenDto.merchantId,
      sessionId: generateTokenDto.sessionId,
      type: 'customer', // 标记这是顾客的token
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  /**
   * 2. 新增方法：验证Token并获取用户资料，同时检查有效订单
   * @param payload 从JWT守卫解析出的用户信息
   * @returns 返回用户信息以及可能存在的有效订单ID
   */
  async validateAndGetProfile(payload: JwtPayload) {
    const { merchantId, sessionId } = payload;

    // 查找该会话下是否有状态为 RECEIVED 或 PREPARING 的订单
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        merchantId,
        sessionId,
        status: {
          in: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.COMPLETED],
        },
      },
      orderBy: {
        createdAt: 'desc', // 获取最新的一个
      },
    });

    return {
      merchantId,
      sessionId,
      type: payload.type,
      activeOrderId: activeOrder ? activeOrder.id : null,
    };
  }
}
