import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  // 获取指定商户的在售菜单项 (供顾客端使用)
  async getMenuForCustomer(merchantId: number) {
    return this.prisma.menuItem.findMany({
      where: {
        merchantId: merchantId,
        isAvailable: true,
      },
    });
  }

  // 获取指定商户的所有菜单项 (供商户后台使用)
  async getMenuForManagement(merchantId: number) {
    return this.prisma.menuItem.findMany({
      where: {
        merchantId: merchantId,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // 新增菜品
  async createMenuItem(merchantId: number, createMenuItemDto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: {
        ...createMenuItemDto,
        merchantId,
      },
    });
  }

  // 更新菜品
  async updateMenuItem(menuItemId: number, updateMenuItemDto: UpdateMenuItemDto) {
    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateMenuItemDto,
    });
  }

  // 删除菜品
  async deleteMenuItem(menuItemId: number) {
    return this.prisma.menuItem.delete({
      where: { id: menuItemId },
    });
  }
}
