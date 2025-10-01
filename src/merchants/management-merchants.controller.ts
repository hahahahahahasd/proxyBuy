import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('[商户端] B-Side / 菜品管理 Menu Management')
@Controller('management/merchants')
export class ManagementMerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('menu-items')
  @ApiOperation({ summary: '发布新菜品（可包含规格）' })
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    const menuItem = await this.merchantsService.createMenuItem(
      createMenuItemDto.merchantId,
      createMenuItemDto,
    );
    return { success: true, data: menuItem };
  }

  @Get(':merchantId/menu-items')
  @ApiOperation({ summary: '获取商户的完整菜品列表（供管理使用）' })
  async findAllForManagement(@Param('merchantId', ParseIntPipe) merchantId: number) {
    const menuItems = await this.merchantsService.findAllForManagement(merchantId);
    return { success: true, data: menuItems };
  }

  @Put('menu-items/:id')
  @ApiOperation({ summary: '更新菜品信息（包括规格）' })
  async updateMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    const menuItem = await this.merchantsService.updateMenuItem(id, updateMenuItemDto);
    return { success: true, data: menuItem };
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: '删除一个菜品' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMenuItem(@Param('id', ParseIntPipe) id: number) {
    await this.merchantsService.deleteMenuItem(id);
    // No content should be returned for a successful DELETE
  }
}
