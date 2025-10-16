import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MenuView from '../views/MenuView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import StoreSelectionView from '../views/StoreSelectionView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import InvalidCredentialView from '../views/InvalidCredentialView.vue' // 1. 导入凭证无效页面

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
    // 2. 为凭证无效页面添加路由
    {
      path: '/invalid-credential',
      name: 'invalid-credential',
      component: InvalidCredentialView,
    },
  ],
})

// 3. 添加全局前置守卫
router.beforeEach((to, _from, next) => {
  // 定义一个白名单，这些路径不需要 token 即可访问
  const publicPages = ['/invalid-credential'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token'); // 从 localStorage 获取 token

  // 如果访问的是需要权限的页面，但没有 token
  if (authRequired && !token) {
    // 重定向到凭证无效页面
    return next('/invalid-credential');
  }

  // 否则，正常访问
  next();
});

export default router
