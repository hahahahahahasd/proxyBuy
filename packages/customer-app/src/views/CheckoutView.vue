<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import { useMerchantStore } from "@/stores/merchant";
import { useRouter } from "vue-router";
import { showNotify } from "vant";
import type { SpecOption } from "@/stores/cart";

const cartStore = useCartStore();
const merchantStore = useMerchantStore();
const router = useRouter();

const formatSpecifications = (
  selectedOptions: Record<string, SpecOption>
): string => {
  const specString = Object.values(selectedOptions)
    .map((opt) => opt.name)
    .join(" / ");
  return specString ? `规格: ${specString}` : "";
};

const submitOrder = async () => {
  if (!merchantStore.selectedMerchant) {
    showNotify({ type: "danger", message: "请先选择一个门店" });
    router.push("/store-selection");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showNotify({ type: "danger", message: "凭证无效" });
    router.push("/invalid-credential");
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
        })
      ),
    })
  );

  if (orderItems.length === 0) {
    showNotify({ type: "warning", message: "购物车是空的" });
    return;
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 添加Token到请求头
      },
      body: JSON.stringify({
        // 后端会从Token中解析 merchantId 和 sessionId
        items: orderItems,
        storeName: merchantStore.selectedMerchant.name,
        storeAddress: merchantStore.selectedMerchant.address,
        tableId: 1, // 暂时硬编码桌号
        merchantId: 1, // 暂时硬编码商户ID
      }),
    });

    const result = await response.json();
    if (!result.success) {
      // 如果是401等认证错误，后端可能会返回特定的错误信息
      if (response.status === 401) {
        throw new Error("认证失败");
      }
      throw new Error(result.message || "Order submission failed");
    }

    const orderId = result.data.id;
    cartStore.clearCart();

    // Redirect to the new order detail page
    router.push(`/order/${orderId}`);
  } catch (error: any) {
    console.error("Failed to submit order:", error);
    showNotify({ type: "danger", message: error.message || "下单失败" });
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
            <!-- 0元购活动开启时，单价显示为0 -->
            <div v-if="cartStore.showZeroYuanDiscount">
              单价: <span style="text-decoration: line-through;">¥{{
                (
                  cartItem.item.price +
                  Object.values(cartItem.selectedOptions).reduce(
                    (sum, opt) => sum + (opt.priceChange || 0),
                    0
                  )
                ).toFixed(2)
              }}</span>
              <span style="color: red; font-weight: bold; margin-left: 5px;">¥0.00</span>
            </div>
            <!-- 默认单价显示 -->
            <div v-else>
              单价: ¥{{
                (
                  cartItem.item.price +
                  Object.values(cartItem.selectedOptions).reduce(
                    (sum, opt) => sum + (opt.priceChange || 0),
                    0
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
