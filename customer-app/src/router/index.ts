import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MenuView from '../views/MenuView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import StoreSelectionView from '../views/StoreSelectionView.vue'
import OrderDetailView from '../views/OrderDetailView.vue' // 1. Import the new component

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
    // 2. Add the new route for order details
    {
      path: '/order/:id',
      name: 'order-detail',
      component: OrderDetailView,
      props: true, // Automatically pass route params as component props
    },
  ],
})

// We can remove the beforeEach guard as it's not fully implemented
// and the logic is better handled within the component itself.

export default router