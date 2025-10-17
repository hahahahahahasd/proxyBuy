import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

// 定义嵌套的 DTO
class OrderItemDto {
  @IsInt()
  menuItemId: number;

  @IsInt()
  quantity: number;

  @IsArray()
  @IsOptional()
  selectedSpecifications?: any[];
}

/**
 * 专用于顾客端创建订单的 DTO。
 * merchantId 和 sessionId 将从 JWT Token 中解析，因此不包含在此 DTO 中。
 */
export class CreateCustomerOrderDto {
  @IsInt()
  tableId: number;

  @IsNotEmpty()
  storeName: string;

  @IsNotEmpty()
  storeAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
