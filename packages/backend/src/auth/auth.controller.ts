import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('[公共] 1. 认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiOperation({
    summary: '生成顾客端Token',
    description: '为指定的商户和桌号生成一个用于点餐的JWT。',
  })
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    const token = await this.authService.generateCustomerToken(generateTokenDto);
    return { success: true, data: token };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '验证Token并获取用户信息',
    description:
      '这是一个受保护的路由。如果Token有效，它将返回Token中编码的用户信息（如merchantId, tableId）以及当前桌位是否存在有效订单ID。',
  })
  async getProfile(@Request() req) {
    // 调用新的service方法来包含有效订单检查
    const profileData = await this.authService.validateAndGetProfile(req.user);
    return { success: true, data: profileData };
  }
}
