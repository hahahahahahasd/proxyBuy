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
  isAvailable: boolean;
  merchantId: number;
  specifications?: Specification[]; // 商品规格
}
