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
      include: {
        specifications: {
          include: {
            options: true,
          },
        },
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
      include: {
        specifications: {
          include: {
            options: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // 新增菜品
  async createMenuItem(
    merchantId: number,
    createMenuItemDto: CreateMenuItemDto,
  ) {
    const {
      name,
      price,
      originalPrice,
      description,
      imageUrl,
      specifications,
    } = createMenuItemDto;

    return this.prisma.menuItem.create({
      data: {
        name,
        price,
        originalPrice,
        description,
        imageUrl,
        merchantId,
        specifications: specifications
          ? {
              create: specifications.map((spec) => ({
                name: spec.name,
                options: {
                  create: spec.options.map((opt) => ({
                    name: opt.name,
                    price: opt.price,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        specifications: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  // 更新菜品
  async updateMenuItem(
    menuItemId: number,
    updateMenuItemDto: UpdateMenuItemDto,
  ) {
    const {
      name,
      price,
      originalPrice,
      description,
      imageUrl,
      specifications,
    } = updateMenuItemDto;

    // 使用事务来确保原子性
    return this.prisma.$transaction(async (prisma) => {
      // 1. 更新菜品基本信息
      await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
          name,
          price,
          originalPrice,
          description,
          imageUrl,
        },
      });

      // 2. 如果有规格信息，则先删除旧的，再创建新的
      if (specifications) {
        // 删除旧的规格和选项
        await prisma.specification.deleteMany({
          where: { menuItemId: menuItemId },
        });

        // 创建新的规格和选项
        for (const spec of specifications) {
          await prisma.specification.create({
            data: {
              name: spec.name,
              menuItemId: menuItemId,
              options: {
                create: spec.options.map((opt) => ({
                  name: opt.name,
                  price: opt.price,
                })),
              },
            },
          });
        }
      }

      // 3. 返回完整更新后的菜品信息
      return prisma.menuItem.findUnique({
        where: { id: menuItemId },
        include: {
          specifications: {
            include: {
              options: true,
            },
          },
        },
      });
    });
  }

  // 删除菜品
  async deleteMenuItem(menuItemId: number) {
    // 注意: Prisma 的级联删除默认是关闭的。
    // 如果 schema.prisma 中设置了 onDelete: Cascade，则这里不需要手动删除关联数据。
    // 假设没有设置，我们使用事务来确保原子性。
    return this.prisma.$transaction(async (prisma) => {
      // 1. 删除与菜品关联的规格和选项
      await prisma.specification.deleteMany({
        where: { menuItemId: menuItemId },
      });
      // 2. 删除菜品本身
      return prisma.menuItem.delete({
        where: { id: menuItemId },
      });
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
