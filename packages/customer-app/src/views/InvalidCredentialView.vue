<template>
  <div class="invalid-credential-container">
    <div class="icon-box">
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="#fff3f3"
          stroke="#ff4d4f"
          stroke-width="3"
        />
        <line
          x1="22"
          y1="22"
          x2="42"
          y2="42"
          stroke="#ff4d4f"
          stroke-width="4"
          stroke-linecap="round"
        />
        <line
          x1="42"
          y1="22"
          x2="22"
          y2="42"
          stroke="#ff4d4f"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <h1>凭证无效</h1>
    <p>您的访问凭证无效或已过期<br />请重新扫码或联系商家。</p>
    <!-- <van-button type="primary" class="retry-btn" @click="$router.replace('/')"
      >返回首页</van-button
    > -->
  </div>
</template>

<script setup lang="ts">
// 无需脚本逻辑
</script>

<style scoped>
.invalid-credential-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff6f6 0%, #ffeaea 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  color: #333;
  padding: 32px 16px;
}

.icon-box {
  margin-bottom: 24px;
  animation: shake 0.7s;
}

@keyframes shake {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-8px);
  }
  40%,
  60% {
    transform: translateX(8px);
  }
}

h1 {
  font-size: 2.2rem;
  color: #ff4d4f;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: 2px;
}

p {
  font-size: 1.15rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.retry-btn {
  width: 160px;
  font-size: 1rem;
  border-radius: 24px;
  box-shadow: 0 2px 8px #ff4d4f22;
}
</style>
