import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

// 定义用户信息的类型
export interface UserProfile {
  merchantId: number;
  tableId: number;
  iat: number;
  exp: number;
  activeOrderId?: number; // 新增：可选的有效订单ID
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<UserProfile | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  // 设置axios的默认请求头
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  /**
   * 检查本地Token的有效性
   * @returns Promise<boolean> - Token是否有效
   */
  async function checkAuth(): Promise<boolean> {
    if (!token.value) {
      isAuthenticated.value = false;
      return false;
    }

    try {
      // 更新axios的请求头以防万一
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      const response = await axios.get('/api/auth/profile');
      
      if (response.data && response.data.success) {
        user.value = response.data.data;
        isAuthenticated.value = true;
        return true;
      } else {
        // 如果后端返回 success: false
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      await logout();
      return false;
    }
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('customer_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    isAuthenticated.value = true;
  }

  /**
   * 登出
   */
  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    token.value = null;
    localStorage.removeItem('customer_token');
    delete axios.defaults.headers.common['Authorization'];
  }

  return {
    isAuthenticated,
    user,
    token,
    checkAuth,
    setToken,
    logout,
  };
});
