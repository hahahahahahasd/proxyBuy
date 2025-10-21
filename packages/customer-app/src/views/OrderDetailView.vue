<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { showNotify } from "vant";
import { socketService } from "@/services/socketService";
import QrcodeVue from "qrcode.vue";
import { useAuthStore } from "@/stores/auth";

// --- Component Props and State ---
const props = defineProps<{ id: string }>();
const router = useRouter();
const authStore = useAuthStore();

const order = ref<any>(null);
const isLoading = ref(true);
const statusText = ref("正在获取订单详情...");
const claimCode = ref<string | null>(null);
const qrCodeData = ref<string | null>(null);

// --- Helper Functions ---
const getStatusClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "status-completed";
    case "CANCELLED":
      return "status-cancelled";
    case "CLOSED":
      return "status-closed";
    case "PREPARING":
      return "status-preparing";
    case "RECEIVED": // Fallthrough
    default:
      return "status-pending";
  }
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    RECEIVED: "等待商家接单",
    PREPARING: "商家支付中",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
    CLOSED: "已关闭",
  };
  return statusMap[status] || "未知状态";
};

// --- Data Fetching ---
const fetchClaimDetails = async (orderId: number) => {
  try {
    // Note: The API endpoint for claim details is now part of the main orders API
    const response = await fetch(`/api/orders/${orderId}/claim-details`);
    const result = await response.json();
    if (result.success) {
      claimCode.value = result.data.claimCode;
      qrCodeData.value = result.data.qrCodeData;
    } else {
      throw new Error(result.message || "Failed to fetch claim details");
    }
  } catch (error) {
    console.error(error);
    showNotify({ type: "danger", message: "无法获取取餐码" });
  }
};

const fetchOrderDetails = async () => {
  isLoading.value = true;
  const token = authStore.token;
  if (!token) {
    // showNotify({ type: "danger", message: "请先登录" });
    router.push("/invalid-credential");
    return;
  }

  try {
    const response = await fetch(`/api/orders/${props.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (result.success) {
      if (result.data.status === "CLOSED") {
        showNotify({ type: "primary", message: "该订单已关闭" });
        router.push("/");
        return;
      }

      order.value = result.data;
      statusText.value = `订单状态: ${formatStatus(order.value.status)}`;

      // If order is already completed, fetch claim details immediately
      if (order.value.status === "COMPLETED") {
        await fetchClaimDetails(order.value.id);
      }

      // Set up WebSocket listeners for real-time updates
      setupWebSocketListeners();
    } else {
      throw new Error("Failed to fetch order details");
    }
  } catch (error) {
    console.error(error);
    statusText.value = "获取订单详情失败";
    showNotify({ type: "danger", message: "无法加载订单" });
  } finally {
    isLoading.value = false;
  }
};

// --- WebSocket Logic ---
const setupWebSocketListeners = () => {
  const orderId = parseInt(props.id);

  socketService.onOrderStatusUpdate(async (updatedOrder) => {
    if (updatedOrder.id !== orderId) return;

    order.value = { ...order.value, ...updatedOrder };
    statusText.value = `订单状态已更新: ${formatStatus(updatedOrder.status)}`;

    // Handle different statuses
    switch (updatedOrder.status) {
      case "COMPLETED":
        showNotify({ type: "success", message: "订单已完成！" });
        await fetchClaimDetails(orderId);
        socketService.disconnect();
        break;

      case "CANCELLED":
        showNotify({ type: "warning", message: "订单已取消", duration: 3000 });
        setTimeout(() => router.push("/"), 3000);
        socketService.disconnect();
        break;

      case "CLOSED":
        showNotify({ type: "primary", message: "订单已关闭" });
        socketService.disconnect();
        break;
    }
  });

  // Connect and join the room if not already in a final state
  if (!["COMPLETED", "CANCELLED", "CLOSED"].includes(order.value?.status)) {
    socketService.connect();
    socketService.joinOrderRoom(orderId);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchOrderDetails();
});

onUnmounted(() => {
  socketService.disconnect();
});
</script>

<template>
  <div class="order-detail-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="router.push('/')" />
    <div v-if="isLoading" class="loading-container">
      <van-loading>{{ statusText }}</van-loading>
    </div>
    <div v-else-if="order" class="content">
      <!-- Claim Details Section -->
      <van-cell-group
        v-if="order.status === 'COMPLETED' && claimCode"
        inset
        title="取餐信息"
      >
        <div class="claim-info-box">
          <div class="claim-code-area">
            <div class="claim-code-label">取餐码</div>
            <div class="claim-code-value">{{ claimCode }}</div>
          </div>
          <div class="qrcode-container" v-if="qrCodeData">
            <qrcode-vue :value="qrCodeData" :size="150" level="H" />
          </div>
        </div>
      </van-cell-group>

      <!-- Order Status Section -->
      <van-cell-group inset>
        <van-cell title="订单号" :value="order.id" />
        <van-cell
          v-if="order.storeName"
          title="下单门店"
          :value="order.storeName"
        />
        <van-cell
          v-if="order.storeAddress"
          title="门店地址"
          :label="order.storeAddress"
        />
        <van-cell title="订单状态">
          <template #value>
            <van-tag :class="getStatusClass(order.status)" size="medium">{{
              formatStatus(order.status)
            }}</van-tag>
          </template>
        </van-cell>
        <van-cell
          title="总价"
          :value="`¥${(order.totalPrice || 0).toFixed(2)}`"
        />
      </van-cell-group>

      <!-- Order Items Section -->
      <van-cell-group inset title="菜品列表">
        <van-cell
          v-for="item in order.items"
          :key="item.id"
          :title="item.menuItem.name"
        >
          <template #label>{{ `数量: ${item.quantity}` }}</template>
          <template #value>{{
            `¥${(item.menuItem.price * item.quantity).toFixed(2)}`
          }}</template>
        </van-cell>
      </van-cell-group>
    </div>
    <div v-else class="empty-container">
      <van-empty description="无法找到该订单" />
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  padding-bottom: 20px;
}
.loading-container,
.empty-container {
  margin-top: 40px;
}
.content {
  padding: 16px 0;
}

/* Claim Details Styling */
.claim-info-box {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.claim-code-area {
  text-align: center;
}
.claim-code-label {
  font-size: 14px;
  color: var(--van-text-color-2);
  margin-bottom: 10px;
}
.claim-code-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--van-blue);
  letter-spacing: 2px;
}
.qrcode-container {
  padding-top: 8px;
}

/* Using direct background-color for better override */
.van-tag {
  color: white !important;
}
.status-pending {
  background-color: var(--van-orange) !important;
}
.status-preparing {
  background-color: var(--van-blue) !important;
}
.status-completed {
  background-color: var(--van-green) !important;
}
.status-cancelled,
.status-closed {
  background-color: var(--van-gray-6) !important;
}
</style>
