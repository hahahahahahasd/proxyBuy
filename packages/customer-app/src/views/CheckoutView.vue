<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { useMerchantStore } from '@/stores/merchant';
import { useRouter } from 'vue-router';
import { showNotify } from 'vant';
import type { SpecOption } from '@/stores/cart';

const cartStore = useCartStore();
const merchantStore = useMerchantStore();
const router = useRouter();

const formatSpecifications = (
  selectedOptions: Record<string, SpecOption>,
): string => {
  const specString = Object.values(selectedOptions)
    .map((opt) => opt.name)
    .join(' / ');
  return specString ? `规格: ${specString}` : '';
};

const submitOrder = async () => {
  if (!merchantStore.selectedMerchant) {
    showNotify({ type: 'danger', message: '请先选择一个门店' });
    router.push('/store-selection');
    return;
  }

  const orderItems = Object.values(cartStore.items).map(
    ({ item, quantity, selectedOptions }) => ({
      menuItemId: item.id,
      quantity,
      selectedSpecifications: Object.entries(selectedOptions).map(
        ([specName, option]) => ({
          name: specName,
          option: option.name,
        }),
      ),
    }),
  );

  if (orderItems.length === 0) {
    showNotify({ type: 'warning', message: '购物车是空的' });
    return;
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: 1,
        tableId: 1, // TODO: Use dynamic table ID
        items: orderItems,
        storeName: merchantStore.selectedMerchant.name,
        storeAddress: merchantStore.selectedMerchant.address,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Order submission failed');
    }

    const orderId = result.data.id;
    cartStore.clearCart();

    // Redirect to the new order detail page
    router.push(`/order/${orderId}`);
  } catch (error) {
    console.error('Failed to submit order:', error);
    showNotify({ type: 'danger', message: '下单失败' });
  }
};
</script>

<template>
  <div>
    <van-nav-bar title="确认订单" left-arrow @click-left="router.back()" />
    <div class="order-details">
      <van-cell-group inset title="订单详情">
        <van-cell
          v-for="(cartItem, cartId) in cartStore.items"
          :key="cartId"
          :title="cartItem.item.name"
          :value="`x ${cartItem.quantity}`"
        >
          <template #label>
            <div>{{ formatSpecifications(cartItem.selectedOptions) }}</div>
            <div>
              单价: ¥{{
                (
                  cartItem.item.price +
                  Object.values(cartItem.selectedOptions).reduce(
                    (sum, opt) => sum + (opt.priceChange || 0),
                    0,
                  )
                ).toFixed(2)
              }}
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    <van-submit-bar
      :price="cartStore.totalPrice * 100"
      button-text="提交订单"
      @submit="submitOrder"
    />
  </div>
</template>

<style scoped>
.order-details {
  padding: 16px 0;
}
</style>
