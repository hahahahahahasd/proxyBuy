<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useCartStore } from "@/stores/cart";
import { useMerchantStore } from "@/stores/merchant"; // Import the new store
import type { MenuItem, SpecOption } from "@/types";
import { useRouter } from "vue-router";
import { showNotify } from "vant";
import axios from 'axios';

// --- Stores and Router ---
const cartStore = useCartStore();
const merchantStore = useMerchantStore();
const router = useRouter();

// --- Component State ---
interface Category {
  name: string;
  items: MenuItem[];
}
const categories = ref<Category[]>([]);
const isLoading = ref(true);
const activeCategory = ref(0);

// --- Spec Popup State ---
const showSpecPopup = ref(false);
const currentItem = ref<MenuItem | null>(null);
const selectedSpecs = ref<Record<string, SpecOption>>({});
const specQuantity = ref(1);
// const showZeroYuanDiscount = ref(true); // 已废弃：改为从 cartStore 中获取

// --- Computed Properties ---
const selectedMerchantName = computed(
  () => merchantStore.selectedMerchant?.name || "请选择门店"
);

// 新增：从 cartStore 中获取0元购状态
const showZeroYuanDiscount = computed(() => cartStore.showZeroYuanDiscount);

const specPopupPrice = computed(() => {
  if (!currentItem.value) return 0;
  const basePrice = currentItem.value.price;
  const optionsPrice = Object.values(selectedSpecs.value).reduce(
    (sum, opt) => sum + (opt.priceChange || 0),
    0
  );
  return basePrice + optionsPrice;
});

// --- Methods ---
const fetchData = async () => {
  if (!merchantStore.selectedMerchant?.id) {
    showNotify({ type: "warning", message: "未选择门店，无法加载菜单" });
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const merchantId = 1;
    const response = await axios.get(`/api/merchants/${merchantId}/menu`);
    const result = response.data;

    if (result.success) {
      categories.value = result.data;
    } else {
      throw new Error(result.message || "获取菜单数据失败");
    }
  } catch (error: any) {
    console.error("加载菜单时出错:", error);
    const message = axios.isAxiosError(error) ? error.response?.data?.message : error.message;
    showNotify({ type: "danger", message: message || "菜单加载失败" });
  } finally {
    isLoading.value = false;
  }
};

const openSpecPopup = (item: MenuItem) => {
  currentItem.value = item;
  selectedSpecs.value = {};
  item.specifications?.forEach((spec) => {
    if (spec.options && spec.options.length > 0 && spec.options[0]) {
      selectedSpecs.value[spec.name] = spec.options[0];
    }
  });
  specQuantity.value = 1;
  showSpecPopup.value = true;
};

const selectOption = (specName: string, option: SpecOption) => {
  selectedSpecs.value[specName] = option;
};

const handleAddToCart = () => {
  if (currentItem.value) {
    cartStore.addOrUpdateItem(
      currentItem.value,
      selectedSpecs.value
    );
    showSpecPopup.value = false;
    showNotify({ type: "success", message: "已加入购物车" });
  }
};

const addSimpleItemToCart = (item: MenuItem) => {
  cartStore.addOrUpdateItem(item, {});
  showNotify({ type: "success", message: "已加入购物车" });
};

const goToCheckout = () => router.push("/checkout");
const goToStoreSelection = () => router.push("/store-selection");

// --- Lifecycle Hooks ---
onMounted(() => {
  // 为了演示，在此处激活0元购模式。实际应用中，这可能由其他逻辑（如API调用）触发。
  cartStore.setZeroYuanDiscount(true); 
  
  cartStore.clearCart();
  fetchData();
});
</script>

<template>
  <div class="menu-page">
    <van-nav-bar :title="selectedMerchantName">
      <template #left
        ><van-icon name="arrow-left" @click="router.back()"
      /></template>
      <template #right
        ><div @click="goToStoreSelection">切换门店</div></template
      >
    </van-nav-bar>

    <!-- Conditional Rendering based on store selection -->
    <div v-if="!merchantStore.selectedMerchant" class="empty-state">
      <van-empty description="请先选择一个门店才能开始点餐哦">
        <van-button type="primary" @click="goToStoreSelection"
          >去选择门店</van-button
        >
      </van-empty>
    </div>

    <div v-else-if="isLoading" class="loading-container"><van-loading /></div>

    <div v-else class="main-content">
      <div class="sidebar-wrapper">
        <van-sidebar v-model="activeCategory">
          <van-sidebar-item
            v-for="(c, i) in categories"
            :key="i"
            :title="c.name"
          />
        </van-sidebar>
      </div>
      <div class="menu-list-wrapper">
        <div v-for="c in categories" :key="c.name">
          <h3 class="category-title">{{ c.name }}</h3>
          <van-card
            v-for="item in c.items"
            :key="item.id"
            :desc="item.description || ''"
            :title="item.name"
            :thumb="item.imageUrl || 'https://img.yzcdn.cn/vant/ipad.jpeg'"
          >
            <template #price>
              <!-- 0元购活动开启 -->
              <div v-if="showZeroYuanDiscount" class="price-container">
                <span
                  class="current-price"
                  style="color: red; font-weight: bold"
                  >¥0.00</span
                >
                <span class="original-price">
                  ¥{{ item.price.toFixed(2) }}
                </span>
              </div>
              <!-- 默认价格显示 -->
              <div v-else class="price-container">
                <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
                <span
                  v-if="item.originalPrice && item.originalPrice > item.price"
                  class="original-price"
                >
                  ¥{{ item.originalPrice.toFixed(2) }}
                </span>
              </div>
            </template>
            <template #footer>
              <van-button
                v-if="item.specifications?.length"
                size="small"
                type="primary"
                @click="openSpecPopup(item)"
                >选规格</van-button
              >
              <van-button
                v-else
                size="small"
                type="primary"
                @click="addSimpleItemToCart(item)"
                >加入购物车</van-button
              >
            </template>
          </van-card>
        </div>
      </div>
    </div>

    <van-submit-bar
      v-if="cartStore.totalItems > 0"
      :price="cartStore.totalPrice * 100"
      button-text="去结算"
      @submit="goToCheckout"
    />

    <van-popup v-model:show="showSpecPopup" round position="bottom">
      <div class="spec-popup" v-if="currentItem">
        <h3 class="spec-popup-title">{{ currentItem.name }}</h3>
        <div
          v-for="spec in currentItem.specifications"
          :key="spec.name"
          class="spec-group"
        >
          <h4>{{ spec.name }}</h4>
          <div class="spec-options-container">
            <van-tag
              v-for="option in spec.options"
              :key="option.id"
              :type="
                selectedSpecs[spec.name]?.id === option.id
                  ? 'primary'
                  : 'default'
              "
              @click="selectOption(spec.name, option)"
              size="large"
              class="spec-option"
            >
              {{ option.name }}
              <span v-if="option.priceChange">
                (+¥{{ option.priceChange }})</span
              >
            </van-tag>
          </div>
        </div>
        <div class="spec-footer">
          <div class="price">¥{{ specPopupPrice.toFixed(2) }}</div>
          <van-stepper v-model="specQuantity" min="1" max="1" />
        </div>
        <van-button type="primary" block @click="handleAddToCart"
          >加入购物车</van-button
        >
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.menu-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.sidebar-wrapper {
  width: 80px;
  height: 100%;
  overflow-y: auto;
}
.menu-list-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 0 10px;
}
.van-card {
  margin-bottom: 10px;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.category-title {
  margin: 16px 0 8px 16px;
  font-size: 14px;
  color: #323233;
  font-weight: 500;
}
.price-container {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.current-price {
  color: var(--van-danger-color);
  font-size: 16px;
  font-weight: bold;
}
.original-price {
  color: #969799;
  text-decoration: line-through;
  font-size: 12px;
}
.spec-popup {
  padding: 16px;
}
.spec-popup-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 20px;
}
.spec-group {
  margin-bottom: 20px;
}
.spec-group h4 {
  font-size: 14px;
  margin: 0 0 10px;
  color: #646566;
}
.spec-options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.spec-option {
  cursor: pointer;
  padding: 6px 12px;
}
.spec-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 16px;
}
.price {
  font-size: 18px;
  font-weight: bold;
  color: var(--van-danger-color);
}
</style>