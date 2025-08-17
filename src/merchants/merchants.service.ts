import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  // 获取指定商户的所有在售菜单项
  async getMenu(merchantId: number) {
    return this.prisma.menuItem.findMany({
      where: {
        merchantId: merchantId,
        isAvailable: true,
      },
    });
  }
}
