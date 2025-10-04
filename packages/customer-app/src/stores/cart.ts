import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/types'

// 定义规格选项和规格组的类型
export interface SpecOption {
  id: string;
  name: string;
  priceChange?: number; // 价格变化
}

export interface Specification {
  name: string;
  options: SpecOption[];
}

// 购物车项的新结构
export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedOptions: Record<string, SpecOption>; // { '温度': { id: 'hot', name: '热' }, '糖度': ... }
}

// 生成购物车项的唯一ID
const generateCartItemId = (itemId: number, selectedOptions: Record<string, SpecOption>): string => {
  const optionIds = Object.values(selectedOptions).map(opt => opt.id).sort().join('_');
  return `${itemId}_${optionIds}`;
};


export const useCartStore = defineStore('cart', () => {
  // 购物车 items 的结构变为 Record<string, CartItem>
  const items = ref<Record<string, CartItem>>({})

  const totalItems = computed(() => {
    return Object.values(items.value).reduce((sum, cartItem) => sum + cartItem.quantity, 0)
  })

  const totalPrice = computed(() => {
    return Object.values(items.value).reduce((sum, cartItem) => {
      const optionsPrice = Object.values(cartItem.selectedOptions).reduce((s, opt) => s + (opt.priceChange || 0), 0);
      const itemTotalPrice = (cartItem.item.price + optionsPrice) * cartItem.quantity;
      return sum + itemTotalPrice;
    }, 0)
  })

  // 添加或更新购物车项
  function addOrUpdateItem(item: MenuItem, selectedOptions: Record<string, SpecOption>, quantity: number) {
    const cartItemId = generateCartItemId(item.id, selectedOptions);
    
    if (items.value[cartItemId]) {
      items.value[cartItemId].quantity += quantity;
    } else {
      items.value[cartItemId] = { item, selectedOptions, quantity };
    }
  }

  // 直接更新购物车中某一项的数量
  function updateItemQuantity(cartItemId: string, quantity: number) {
    if (items.value[cartItemId]) {
      if (quantity > 0) {
        items.value[cartItemId].quantity = quantity;
      } else {
        delete items.value[cartItemId];
      }
    }
  }

  function clearCart() {
    items.value = {}
  }

  return {
    items,
    totalItems,
    totalPrice,
    addOrUpdateItem,
    updateItemQuantity,
    clearCart,
  }
})