import {
  Controller,
  Get,
  Post,
  Body,
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

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':merchantId/menu')
  getMenuForCustomer(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.merchantsService.getMenuForCustomer(merchantId);
  }

  @Get(':merchantId/menu/management')
  getMenuForManagement(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.merchantsService.getMenuForManagement(merchantId);
  }

  @Post(':merchantId/menu')
  createMenuItem(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.merchantsService.createMenuItem(merchantId, createMenuItemDto);
  }

  @Put('/menu/:menuItemId')
  updateMenuItem(
    @Param('menuItemId', ParseIntPipe) menuItemId: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.merchantsService.updateMenuItem(menuItemId, updateMenuItemDto);
  }

  @Delete('/menu/:menuItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMenuItem(@Param('menuItemId', ParseIntPipe) menuItemId: number) {
    return this.merchantsService.deleteMenuItem(menuItemId);
  }
}
