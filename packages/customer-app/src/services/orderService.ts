import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import type { Order } from '@/types';

export async function fetchActiveOrder(): Promise<Order | null> {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return null;
  }

  try {
    // 使用全局配置的 axios 实例，它已经包含了 token 和正确的相对路径
    const response = await axios.get('/api/orders/active/session');

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch active order:', error);
    // 如果错误是 401 或 403 (认证失败)，则自动登出
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      authStore.logout();
    }
    return null;
  }
}
