import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { ManagementMerchantsController } from './management-merchants.controller';
import { CustomerMerchantsController } from './customer-merchants.controller';

@Module({
  controllers: [ManagementMerchantsController, CustomerMerchantsController],
  providers: [MerchantsService],
})
export class MerchantsModule {}
