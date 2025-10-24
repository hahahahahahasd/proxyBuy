import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MenuView from '@/views/MenuView.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import StoreSelectionView from '@/views/StoreSelectionView.vue';
import OrderDetailView from '@/views/OrderDetailView.vue';
import InvalidCredentialView from '@/views/InvalidCredentialView.vue';
import { useAuthStore } from '@/stores/auth';
import { fetchActiveOrder } from '@/services/orderService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView', // 统一使用 PascalCase 命名
      component: HomeView,
    },
    {
      path: '/menu',
      name: 'MenuView',
      component: MenuView,
    },
    {
      path: '/checkout',
      name: 'CheckoutView',
      component: CheckoutView,
    },
    {
      path: '/store-selection',
      name: 'StoreSelectionView',
      component: StoreSelectionView,
    },
    {
      path: '/order/:id',
      name: 'OrderDetailView',
      component: OrderDetailView,
      props: true,
    },
    {
      path: '/invalid-credential',
      name: 'InvalidCredentialView',
      component: InvalidCredentialView,
    },
  ],
});

/**
 * 全局前置守卫:
 * 1. 自动恢复登录状态。
 * 2. 如果用户已有活动订单，则将其锁定在订单详情页，防止返回或重复下单。
 * 3. 保护需要认证的页面。
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 步骤 1: 尝试从 localStorage 恢复 token，初始化认证状态
  if (!authStore.token) {
    const storedToken = localStorage.getItem('customer_token');
    if (storedToken) {
      authStore.setToken(storedToken);
    }
  }

  // 步骤 2: 核心锁定逻辑 - 如果用户已认证，检查是否存在活动订单
  if (authStore.token) {
    try {
      const activeOrder = await fetchActiveOrder();

      if (activeOrder && activeOrder.id) {
        // 如果存在活动订单，则用户应该只能停留在该订单的详情页
        const orderDetailRoute = {
          name: 'OrderDetailView',
          params: { id: activeOrder.id.toString() },
        };

        // 检查用户当前是否已经在正确的订单详情页
        const isAlreadyOnCorrectPage =
          to.name === 'OrderDetailView' && to.params.id === activeOrder.id.toString();

        if (!isAlreadyOnCorrectPage) {
          // 如果不在，则强制重定向过去。这会阻止返回到菜单、结账等页面。
          return next(orderDetailRoute);
        }
      }
    } catch (error) {
      // 如果检查订单时出错（例如 token 过期导致 401，或服务器错误），
      // 打印错误但暂时不阻止导航，让后续的权限检查来处理。
      console.error('检查活动订单时出错:', error);
    }
  }

  // 步骤 3: 处理页面访问权限
  const publicPageNames = ['InvalidCredentialView'];
  const isPublicPage = publicPageNames.includes(to.name as string);

  if (!isPublicPage && !authStore.token) {
    // 如果页面需要认证但用户未登录，重定向到错误提示页
    return next({ name: 'InvalidCredentialView' });
  }

  if (isPublicPage && authStore.token) {
    // 如果用户已登录，但试图访问公共错误页，则重定向到首页
    return next({ name: 'HomeView' });
  }

  // 步骤 4: 所有检查通过，允许正常导航
  next();
});

export default router;
