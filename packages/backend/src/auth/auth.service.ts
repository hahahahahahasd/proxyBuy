import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokenDto } from './dto/generate-token.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 为顾客生成一个访问令牌
   * @param generateTokenDto 包含 merchantId 和 tableId
   * @returns 返回生成的 accessToken
   */
  async generateCustomerToken(
    generateTokenDto: GenerateTokenDto,
  ): Promise<{ accessToken: string }> {
    const payload = {
      merchantId: generateTokenDto.merchantId,
      tableId: generateTokenDto.tableId,
      type: 'customer', // 标记这是顾客的token
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
