import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // DTO validation now ensures sessionId is present and is a string.
    const { merchantId, sessionId } = createOrderDto;
    return this.ordersService.create(createOrderDto, merchantId, sessionId);
  }

  @Get('merchant/:merchantId')
  findAllForMerchant(@Param('merchantId', ParseIntPipe) merchantId: number) {
    return this.ordersService.findAllForMerchant(merchantId);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  simulatePayment(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.simulatePayment(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}