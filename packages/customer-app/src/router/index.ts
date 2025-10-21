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
      name: 'home',
      component: HomeView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/store-selection',
      name: 'store-selection',
      component: StoreSelectionView,
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: OrderDetailView,
      props: true,
    },
    {
      path: '/invalid-credential',
      name: 'invalid-credential',
      component: InvalidCredentialView,
    },
  ],
});

// 全局前置守卫: 实现智能路由跳转
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // 0. (新增) 检查 URL query 中是否有 token
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl && !authStore.isAuthenticated) {
    // 如果有，则存入 store 并清除 URL 上的 token
    authStore.setToken(tokenFromUrl);
    // 使用 replaceState 清理 URL，避免 token 留在历史记录里
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(history.state, '', newUrl);
  }

  // 1. 尝试从 localStorage 恢复 token，以处理页面刷新
  if (!authStore.isAuthenticated) {
    const token = localStorage.getItem('customer_token');
    if (token) {
      authStore.setToken(token);
    }
  }

  // 2. 如果用户已认证，检查是否有活动订单
  //    - 如果有，并且目标不是该订单详情页，则直接跳转过去
  //    - 这是为了让用户刷新页面或重开app后能立刻回到进行中的订单
  if (authStore.isAuthenticated && to.name !== 'order-detail') {
    try {
      const activeOrder = await fetchActiveOrder();
      if (activeOrder && activeOrder.id) {
        // 发现活动订单，执行重定向
        return next({ name: 'order-detail', params: { id: activeOrder.id.toString() } });
      }
    } catch (error) {
      console.error('检查活动订单时出错:', error);
      // 即使检查失败，也应继续正常导航，避免卡住用户
    }
  }

  // 3. 处理页面访问权限
  // const publicPages = ['/invalid-credential'];
  // const authRequired = !publicPages.includes(to.path);

  // if (authRequired && !authStore.isAuthenticated) {
  //   // 需要认证但用户未登录，跳转到错误提示页
  //   return next('/invalid-credential');
  // }

  if (to.path === '/invalid-credential' && authStore.isAuthenticated) {
    // 已登录用户访问错误页，跳转回首页
    return next('/');
  }

  // 4. 所有检查通过，继续正常导航
  next();
});

export default router;
