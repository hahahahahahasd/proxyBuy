import { Controller, Get, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('[顾客端] 3. 门店')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('search')
  @ApiOperation({ summary: '搜索瑞幸咖啡门店 (Search for Luckin Coffee stores)' })
  @ApiQuery({ name: 'city', required: true, description: 'e.g., "北京"' })
  @ApiQuery({ name: 'keywords', required: false, description: 'e.g., "瑞幸咖啡 五道口"' })
  async searchStores(
    @Query('city') city: string,
    @Query('keywords') keywords?: string,
  ) {
    const stores = await this.storesService.searchLuckinCoffee(city, keywords);
    return { success: true, data: stores };
  }
}
