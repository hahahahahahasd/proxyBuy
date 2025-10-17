import { API_BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/auth';

export async function fetchActiveOrder() {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/active/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log('response: ', response);

    // if (response && response.ok) {
    //   const order = await response.json();
    //   return order;
    // } else {
    //   return null;
    // }
  } catch (error) {
    console.error('Failed to fetch active order:', error);
    return null;
  }
}
