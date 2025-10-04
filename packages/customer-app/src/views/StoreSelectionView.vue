<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { showNotify } from "vant";
import { useMerchantStore } from "@/stores/merchant";
import { useDebounceFn } from "@vueuse/core";

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
const city = ref("北京"); // Default city
const cities = ref(["北京", "上海", "广州", "深圳", "成都", "杭州"]); // Add a list of cities
const searchQuery = ref(""); // For the search input

const fetchStores = async () => {
  isLoading.value = true;
  try {
    // 重新调用后端的API
    const keywords = `瑞幸咖啡 ${searchQuery.value}`.trim();
    const response = await fetch(
      `/api/stores/search?city=${city.value}&keywords=${keywords}`
    );
    const result = await response.json();

    if (result.success) {
      stores.value = result.data;
    } else {
      // 如果后端返回 success: false，显示后端的错误信息
      const errorMessage = result.message || "无法加载门店列表";
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error(error);
    showNotify({ type: "danger", message: error.message || "加载门店失败" });
  } finally {
    isLoading.value = false;
  }
};

// 使用debounce防止在每次按键时都触发API调用
const debouncedFetchStores = useDebounceFn(fetchStores, 500);

watch(searchQuery, () => {
  debouncedFetchStores();
});

// Watch for city changes to refetch stores
watch(city, () => {
  fetchStores();
});

const selectStore = (store: Store) => {
  merchantStore.setSelectedMerchant(store);
  showNotify({ type: "success", message: `已选择门店: ${store.name}` });
  router.push("/menu");
};

onMounted(() => {
  fetchStores();
});
</script>

<template>
  <div class="store-selection-page">
    <van-nav-bar title="选择门店" />

    <div class="search-bar-container">
      <select v-model="city" class="city-selector">
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>
      <van-search
        v-model="searchQuery"
        placeholder="搜索门店名称..."
        shape="round"
        class="search-input"
      />
    </div>

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
.search-bar-container {
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #fff;
}
.city-selector {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #f2f2f2;
  border-radius: 16px;
  margin-right: 8px;
  background-color: #f7f8fa;
  color: #323233;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23323233%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 0.65em auto;
  padding-right: 28px; /* Make space for the arrow */
}
.search-input {
  flex-grow: 1;
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