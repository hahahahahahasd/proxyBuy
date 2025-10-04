// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
// 核心修复：让 PrismaService 继承 PrismaClient
// 这样它就拥有了所有 prisma.user, prisma.order 等方法
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // 这是一个最佳实践，确保在模块初始化时，数据库连接已建立
    await this.$connect();
  }

  // 未来您还可以在这里添加自定义的数据库方法
}