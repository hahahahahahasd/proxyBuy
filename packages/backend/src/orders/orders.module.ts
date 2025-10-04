import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CustomerOrdersController } from './customer-orders.controller';
import { ManagementOrdersController } from './management-orders.controller';

@Module({
  providers: [OrdersGateway, OrdersService],
  controllers: [CustomerOrdersController, ManagementOrdersController],
})
export class OrdersModule {}
