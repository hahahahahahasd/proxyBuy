import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenerateTokenDto {
  @ApiProperty({ description: '商户ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  @ApiProperty({
    description: '会话ID (例如, 从一次性URL中提取的唯一标识)',
    example: 'session_abc123',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}
