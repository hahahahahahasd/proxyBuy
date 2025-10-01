import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Merchant {
  id: string;
  name: string;
  address: string;
  location: string;
}

export const useMerchantStore = defineStore('merchant', () => {
  const selectedMerchant = ref<Merchant | null>(null);

  function setSelectedMerchant(merchant: Merchant) {
    selectedMerchant.value = merchant;
  }

  function clearSelectedMerchant() {
    selectedMerchant.value = null;
  }

  return {
    selectedMerchant,
    setSelectedMerchant,
    clearSelectedMerchant,
  };
});
