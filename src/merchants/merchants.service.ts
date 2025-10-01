import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  // 获取指定商户的在售菜单项 (供顾客端使用)，并按分类分组
  async getMenuForCustomer(merchantId: number) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        merchantId: merchantId,
        isAvailable: true,
      },
    });

    // 由于数据库模型当前没有分类，我们将所有菜品放入一个默认分类
    if (menuItems.length === 0) {
      return [];
    }

    return [
      {
        name: '本店推荐',
        items: menuItems,
      },
    ];
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

  // Alias for getMenuForCustomer
  async getMenu(merchantId: number) {
    return this.getMenuForCustomer(merchantId);
  }

  // Alias for getMenuForManagement
  async findAllForManagement(merchantId: number) {
    return this.getMenuForManagement(merchantId);
  }
}
