import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('[顾客端] 2. 订单')
@Controller('orders')
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: '创建新订单' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.createOrderForCustomer(createOrderDto);
    return { success: true, data: order };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个订单详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOrderByIdForCustomer(id);
    return { success: true, data: order };
  }

  @Get(':id/claim-details')
  @ApiOperation({ summary: '获取订单的取件码和二维码' })
  async getClaimDetails(@Param('id', ParseIntPipe) id: number) {
    const details = await this.ordersService.getClaimDetails(id);
    return { success: true, data: details };
  }
}