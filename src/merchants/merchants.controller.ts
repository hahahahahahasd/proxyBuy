import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':merchantId/menu')
  getMenu(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.merchantsService.getMenu(merchantId);
  }
}
