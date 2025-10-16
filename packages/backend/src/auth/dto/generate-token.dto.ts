import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GenerateTokenDto {
  @ApiProperty({ description: '商户ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  @ApiProperty({ description: '桌号ID', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  tableId: number;
}
