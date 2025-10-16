<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button as VanButton, Icon as VanIcon } from 'vant';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 在组件挂载后执行
onMounted(() => {
  // 检查是否存在有效订单ID
  const activeOrderId = authStore.user?.activeOrderId;
  if (activeOrderId) {
    // 如果存在，则直接跳转到该订单的详情页
    router.replace({ 
      name: 'order-detail', 
      params: { id: activeOrderId } 
    });
  }
});

const goToMenu = () => {
  // 如果没有有效订单，则按正常流程进入店铺选择页
  router.push('/store-selection');
};
</script>

<template>
  <div class="home-container">
    <div class="content">
      <van-icon name="shop-o" size="64" color="#1989fa" />
      <h1 class="title">欢迎光临</h1>
      <p class="subtitle">立即开始您的点餐之旅</p>
      <van-button type="primary" round block @click="goToMenu">
        开始点餐
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.content {
  text-align: center;
  padding: 0 40px;
}
.title {
  font-size: 28px;
  color: #323233;
  margin-top: 20px;
  margin-bottom: 10px;
}
.subtitle {
  font-size: 16px;
  color: #969799;
  margin-bottom: 40px;
}
</style>
