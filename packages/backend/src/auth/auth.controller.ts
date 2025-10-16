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
      '这是一个受保护的路由。如果Token有效，它将返回Token中编码的用户信息（如merchantId, tableId）。',
  })
  getProfile(@Request() req) {
    // JwtAuthGuard 会验证Token，并将解析后的payload附加到请求的 `user` 对象上。
    return { success: true, data: req.user };
  }
}
