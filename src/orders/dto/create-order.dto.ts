import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';

class OrderItemDto {
  @IsInt()
  menuItemId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  merchantId: number;

  @IsInt()
  tableId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
