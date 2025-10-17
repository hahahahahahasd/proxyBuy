import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('[顾客端] 2. 订单')
@Controller('orders')
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('active/session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取当前会话的活动订单 (需要Token)' })
  @ApiBearerAuth()
  async getActiveOrderForSession(@Request() req) {
    const { merchantId, sessionId } = req.user;
    const order = await this.ordersService.findActiveOrderBySession(
      merchantId,
      sessionId,
    );
    // 无论是否找到订单，都返回成功的统一结构
    // 如果没有活动订单，data 将为 null，前端可以据此判断
    return { success: true, data: order };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建新订单 (需要Token)' })
  @ApiBearerAuth()
  async createOrder(
    @Request() req,
    @Body() createCustomerOrderDto: CreateCustomerOrderDto,
  ) {
    const { merchantId, sessionId } = req.user;
    const order = await this.ordersService.createOrderForCustomer(
      createCustomerOrderDto,
      merchantId,
      sessionId,
    );
    return { success: true, data: order };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取单个订单详情 (需要Token, 校验Session)' })
  @ApiBearerAuth()
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const { sessionId } = req.user;
    const order = await this.ordersService.getOrderByIdForCustomer(
      id,
      sessionId,
    );
    return { success: true, data: order };
  }

  @Get(':id/claim-details')
  @ApiOperation({ summary: '获取订单的取件码和二维码' })
  async getClaimDetails(@Param('id', ParseIntPipe) id: number) {
    const details = await this.ordersService.getClaimDetails(id);
    return { success: true, data: details };
  }
}
