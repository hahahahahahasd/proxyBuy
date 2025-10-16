import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { MerchantsModule } from './merchants/merchants.module';
import { StoresModule } from './stores/stores.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PrismaModule,
    OrdersModule,
    MerchantsModule,
    StoresModule, // <-- 在这里添加 StoresModule
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
