<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button as VanButton, Icon as VanIcon } from 'vant';

const router = useRouter();

const goToMenu = () => {
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
