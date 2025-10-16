import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '验证Token是否有效',
    description: '这是一个受保护的路由，用于检查请求头中的Token是否有效。',
  })
  validateToken() {
    // 因为 JwtAuthGuard 已经通过，说明 token 是有效的
    return { success: true, message: 'Token is valid.' };
  }
}
