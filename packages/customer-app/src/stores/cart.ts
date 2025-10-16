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
  function addOrUpdateItem(item: MenuItem, selectedOptions: Record<string, SpecOption>) {
    const cartItemId = generateCartItemId(item.id, selectedOptions);
    
    // 如果点击的商品和购物车里的是同一个，则不做任何事
    if (items.value[cartItemId]) {
      return; 
    }
    
    // 如果是新商品，则先清空购物车
    clearCart();
    
    // 然后将新商品以数量为 1 添加到购物车
    items.value[cartItemId] = { item, selectedOptions, quantity: 1 };
  }

  // 直接更新购物车中某一项的数量
  function updateItemQuantity(cartItemId: string, quantity: number) {
    if (items.value[cartItemId]) {
      if (quantity > 0) {
        // 确保更新数量时也不会超过1
        items.value[cartItemId].quantity = 1;
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