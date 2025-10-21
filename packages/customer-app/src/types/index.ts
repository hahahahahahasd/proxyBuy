// src/types/index.ts

export interface SpecOption {
  id: string;
  name: string;
  priceChange?: number;
}

export interface Specification {
  name: string;
  options: SpecOption[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl?: string; // Add optional imageUrl
  originalPrice?: number; // Add optional originalPrice
  isAvailable: boolean;
  merchantId: number;
  specifications?: Specification[]; // 商品规格
}


export interface CartItem {
  id: string; // 使用 "menuItemId_specOptionId1_specOptionId2_..." 格式
  menuItem: MenuItem;
  quantity: number;
  selectedSpecs: Record<string, SpecOption>; // 例如: { "大小": { id: "large", name: "大份" }, "辣度": { id: "hot", name: "特辣" } }
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number; // 单价 (已计算规格)
  name: string; // 商品名称
  specifications: string; // "大份, 特辣"
}

export interface Order {
  id: number;
  merchantId: number;
  tableId: number;
  totalAmount: number;
  status: 'PENDING' | 'RECEIVED' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
