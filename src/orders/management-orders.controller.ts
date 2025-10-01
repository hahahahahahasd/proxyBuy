import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ClaimOrderDto } from './dto/claim-order.dto';
import { SyncQrCodeDto } from './dto/sync-qr-code.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('[商户端] B-Side / 订单管理 Order Management')
@Controller('management/orders')
export class ManagementOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: '获取商户的所有订单 (Get all orders for a merchant)' })
  @ApiResponse({ status: 200, description: 'Returns a list of orders.' })
  async getOrdersByMerchant(
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ) {
    return this.ordersService.getOrdersByMerchant(merchantId);
  }

  @Post(':orderId/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '领取订单 (Claim an order)' })
  @ApiResponse({ status: 200, description: 'Order claimed successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 409, description: 'Order has already been processed.' })
  async claimOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() claimOrderDto: ClaimOrderDto,
  ) {
    return this.ordersService.claimOrder(orderId, claimOrderDto);
  }

  @Post(':orderId/sync-qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '同步二维码并完成订单 (Sync QR code and complete order)' })
  @ApiResponse({ status: 200, description: 'QR code synced and order completed.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async syncQrCode(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() syncQrCodeDto: SyncQrCodeDto,
  ) {
    return this.ordersService.syncQrCode(orderId, syncQrCodeDto);
  }
}