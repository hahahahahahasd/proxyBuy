import { defineStore } from 'pinia'
import { ref } from 'vue'

// 模拟门店数据类型
export interface Store {
  id: number;
  name: string;
  address: string;
  distance: string;
}

export const useStoreSelectionStore = defineStore('store', () => {
  // 模拟门店列表
  const storeList = ref<Store[]>([
    { id: 1, name: '广州天河城店', address: '广东省广州市天河区天河路208号', distance: '800m' },
    { id: 2, name: '深圳海岸城店', address: '广东省深圳市南山区文心五路33号', distance: '1.2km' },
    { id: 3, name: '北京三里屯店', address: '北京市朝阳区三里屯路19号', distance: '2.5km' },
    { id: 4, name: '上海正大广场店', address: '上海市浦东新区陆家嘴西路168号', distance: '500m' },
    { id: 5, name: '成都太古里店', address: '四川省成都市锦江区中纱帽街8号', distance: '3.1km' },
  ]);

  // 当前选中的门店，默认为列表中的第一家
  const selectedStore = ref<Store | null>(storeList.value[0] || null);

  // 根据关键词过滤门店列表
  const filteredStoreList = (keyword: string) => {
    if (!keyword) {
      return storeList.value;
    }
    return storeList.value.filter(store => 
      store.name.includes(keyword) || store.address.includes(keyword)
    );
  };

  // 更新选中的门店
  function selectStore(store: Store) {
    selectedStore.value = store;
  }

  return {
    storeList,
    selectedStore,
    filteredStoreList,
    selectStore,
  }
})
