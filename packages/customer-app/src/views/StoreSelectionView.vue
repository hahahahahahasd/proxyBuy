<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showNotify } from 'vant';
import { useMerchantStore } from '@/stores/merchant';
import { useDebounceFn } from '@vueuse/core';

const router = useRouter();
const merchantStore = useMerchantStore();

interface Store {
  id: string;
  name: string;
  address: string;
  location: string;
}

const stores = ref<Store[]>([]);
const isLoading = ref(true);
const city = ref('北京'); // Default city
const searchQuery = ref(''); // For the search input

const fetchStores = async () => {
  isLoading.value = true;
  try {
    // 重新调用后端的API
    const keywords = `瑞幸咖啡 ${searchQuery.value}`.trim();
    const response = await fetch(
      `/api/stores/search?city=${city.value}&keywords=${keywords}`,
    );
    const result = await response.json();

    if (result.success) {
      stores.value = result.data;
    } else {
      // 如果后端返回 success: false，显示后端的错误信息
      const errorMessage = result.message || '无法加载门店列表';
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error(error);
    showNotify({ type: 'danger', message: error.message || '加载门店失败' });
  } finally {
    isLoading.value = false;
  }
};

// 使用debounce防止在每次按键时都触发API调用
const debouncedFetchStores = useDebounceFn(fetchStores, 500);

watch(searchQuery, () => {
  debouncedFetchStores();
});

const selectStore = (store: Store) => {
  merchantStore.setSelectedMerchant(store);
  showNotify({ type: 'success', message: `已选择门店: ${store.name}` });
  router.push('/menu');
};

onMounted(() => {
  fetchStores();
});
</script>

<template>
  <div class="store-selection-page">
    <van-nav-bar title="选择门店" />

    <van-search
      v-model="searchQuery"
      placeholder="搜索门店名称..."
      shape="round"
    />

    <div v-if="isLoading" class="loading-container">
      <van-loading>正在加载门店...</van-loading>
    </div>

    <van-list v-else :finished="true">
      <van-cell
        v-for="store in stores"
        :key="store.id"
        :title="store.name"
        :label="store.address"
        is-link
        @click="selectStore(store)"
      />
    </van-list>

    <van-empty
      v-if="!isLoading && stores.length === 0"
      description="没有找到相关门店"
    />
  </div>
</template>

<style scoped>
.store-selection-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.loading-container {
  margin-top: 40px;
  text-align: center;
}
.van-list {
  flex: 1;
  overflow-y: auto;
}
</style>