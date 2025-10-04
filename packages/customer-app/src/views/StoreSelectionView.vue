<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { showNotify, IndexBar, IndexAnchor, Cell } from "vant";
import { useMerchantStore } from "@/stores/merchant";
import { useDebounceFn } from "@vueuse/core";
import { areaList } from "@/data/area";
import { pinyin } from "pinyin-pro";

const router = useRouter();
const merchantStore = useMerchantStore();

// --- Component State ---
const viewMode = ref<'city-selection' | 'store-list'>('city-selection');
const stores = ref<any[]>([]);
const isLoading = ref(false);
const city = ref("北京");
const searchQuery = ref("");

// --- City Data Processing ---
const cityList = computed(() => {
  const cities = Object.values(areaList.city_list);
  const groupedCities: { [key: string]: string[] } = {};

  cities.forEach((cityName) => {
    const firstLetter = pinyin(cityName, { pattern: 'first' })[0].toUpperCase();
    if (!groupedCities[firstLetter]) {
      groupedCities[firstLetter] = [];
    }
    groupedCities[firstLetter].push(cityName);
  });

  // Sort keys alphabetically
  return Object.keys(groupedCities)
    .sort()
    .reduce((acc, key) => {
      acc[key] = groupedCities[key].sort((a, b) => a.localeCompare(b, 'zh-CN'));
      return acc;
    }, {} as { [key: string]: string[] });
});

const indexList = computed(() => Object.keys(cityList.value));
const simulatedGpsCity = ref("广州市"); // Simulated GPS city

// --- Functions ---
const onCitySelect = (selectedCity: string) => {
  city.value = selectedCity.replace('市', ''); // Remove '市' for API call
  viewMode.value = 'store-list';
  fetchStores();
};

const switchToCitySelection = () => {
  viewMode.value = 'city-selection';
};

const fetchStores = async () => {
  isLoading.value = true;
  try {
    const keywords = `瑞幸咖啡 ${searchQuery.value}`.trim();
    const response = await fetch(
      `/api/stores/search?city=${city.value}&keywords=${keywords}`
    );
    const result = await response.json();
    if (result.success) {
      stores.value = result.data;
    } else {
      throw new Error(result.message || "无法加载门店列表");
    }
  } catch (error: any) {
    showNotify({ type: "danger", message: error.message || "加载门店失败" });
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetchStores = useDebounceFn(fetchStores, 500);

watch(searchQuery, () => {
  debouncedFetchStores();
});

const selectStore = (store: any) => {
  merchantStore.setSelectedMerchant(store);
  showNotify({ type: "success", message: `已选择门店: ${store.name}` });
  router.push("/menu");
};

// Initially, do not fetch stores. Wait for city selection.
</script>

<template>
  <div class="page-container">
    <!-- City Selection View -->
    <div v-if="viewMode === 'city-selection'" class="city-selection-view">
      <van-nav-bar title="选择城市" />
      <van-index-bar :index-list="['#', ...indexList]">
        <!-- GPS Location -->
        <van-index-anchor index="#">定位城市</van-index-anchor>
        <van-cell :title="simulatedGpsCity" @click="onCitySelect(simulatedGpsCity)" is-link />

        <!-- City List -->
        <template v-for="(cities, letter) in cityList" :key="letter">
          <van-index-anchor :index="letter" />
          <van-cell
            v-for="cityName in cities"
            :key="cityName"
            :title="cityName"
            @click="onCitySelect(cityName)"
          />
        </template>
      </van-index-bar>
    </div>

    <!-- Store List View -->
    <div v-if="viewMode === 'store-list'" class="store-list-view">
      <van-nav-bar>
        <template #title>
          <div class="store-nav-title">
            <span>当前城市: {{ city }}</span>
            <van-button size="mini" type="primary" @click="switchToCitySelection">
              [切换]
            </van-button>
          </div>
        </template>
      </van-nav-bar>

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
  </div>
</template>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.city-selection-view, .store-list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.van-index-bar {
  flex: 1;
  overflow-y: auto;
}
.store-list-view .van-list {
  flex: 1;
  overflow-y: auto;
}
.loading-container {
  margin-top: 40px;
  text-align: center;
}
.store-nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>