import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MenuView from '../views/MenuView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import StoreSelectionView from '../views/StoreSelectionView.vue';
import OrderDetailView from '../views/OrderDetailView.vue';
import InvalidCredentialView from '../views/InvalidCredentialView.vue';
import { useAuthStore } from '../stores/auth'; // 1. 导入 auth store

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

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  // 2. 获取 auth store 实例
  // 注意：useAuthStore() 必须在 Pinia 初始化后（即在 router 实例创建后）才能在守卫中调用
  const authStore = useAuthStore();

  const publicPages = ['/invalid-credential'];
  const authRequired = !publicPages.includes(to.path);

  // 3. 使用 store 的状态进行判断
  if (authRequired && !authStore.isAuthenticated) {
    // 如果页面需要认证但用户未通过认证
    return next('/invalid-credential');
  }

  // 如果用户已认证，但尝试访问无效凭证页面，则可以重定向到主页
  if (to.path === '/invalid-credential' && authStore.isAuthenticated) {
    return next('/');
  }

  // 否则，正常访问
  next();
});

export default router;
