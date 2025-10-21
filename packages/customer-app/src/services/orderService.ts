import { API_BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/auth';
import type { Order } from '@/types';

export async function fetchActiveOrder(): Promise<Order | null> {
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

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch active order:', error);
    return null;
  }
}
