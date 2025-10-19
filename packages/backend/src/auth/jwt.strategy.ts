import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Passport会自动验证JWT签名和有效期，然后调用此方法。
   * @param payload 解密后的Token内容
   * @returns 返回值会被附加到请求对象上，通常是 req.user
   */
  async validate(payload: any) {
    // 我们可以在这里丰富请求对象，比如从数据库查询更详细的用户信息
    // 但对于当前场景，直接返回payload就足够了
    return {
      merchantId: payload.merchantId,
      sessionId: payload.sessionId, // 修正：使用 sessionId
      type: payload.type,
    };
  }
}
