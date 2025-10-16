import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('[顾客端] 2. 订单')
@Controller('orders')
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建新订单 (需要Token)' })
  @ApiBearerAuth() // 在Swagger UI中显示认证输入框
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // 从经过验证的Token payload中获取merchantId和tableId
    const { merchantId, tableId } = req.user;

    // 将验证过的信息和订单数据一起传递给服务层
    const orderPayload = {
      ...createOrderDto,
      merchantId,
      tableId,
    };

    const order = await this.ordersService.createOrderForCustomer(orderPayload);
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
