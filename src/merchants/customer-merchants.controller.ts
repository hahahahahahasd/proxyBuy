import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('[顾客端] C-Side / 菜单 Menu')
@Controller('merchants')
export class CustomerMerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':merchantId/menu')
  @ApiOperation({ summary: '获取商户的完整菜单（供顾客使用）' })
  async getMenu(@Param('merchantId', ParseIntPipe) merchantId: number) {
    const menuData = await this.merchantsService.getMenu(merchantId);
    return { success: true, data: menuData };
  }
}
