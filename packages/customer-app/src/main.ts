import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth'; // 1. 导入 auth store

// 样式导入
import '@/assets/css/variable.css';
import '@/assets/css/common.css';
import '@/assets/css/reset.css';
import '@/assets/css/flex.css';
import 'vant/lib/index.css';

// Vant 组件导入
import {
  NavBar, Card, Stepper, SubmitBar, Icon, Cell, CellGroup, Dialog,
  Notify, Loading, Search, Button, Sidebar, SidebarItem, Popup, Tag,
  Field, Area, IndexBar, IndexAnchor, List, Empty
} from 'vant';

// --- Token 处理逻辑 ---
// 优先处理URL中的Token，确保它在任何其他逻辑（特别是Pinia store初始化）之前被设置
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);
  const newUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, newUrl);
}

// 创建一个异步的启动函数
async function bootstrap() {
  const app = createApp(App);

  // 注册 Vant 组件
  app.use(NavBar).use(Card).use(Stepper).use(SubmitBar).use(Icon).use(Cell)
     .use(CellGroup).use(Dialog).use(Notify).use(Loading).use(Search).use(Button)
     .use(Sidebar).use(SidebarItem).use(Popup).use(Tag).use(Field).use(Area)
     .use(IndexBar).use(IndexAnchor).use(List).use(Empty);

  // 注册 Pinia
  app.use(createPinia());

  // --- 2. 执行认证检查 ---
  // Pinia 必须在 useAuthStore 之前被 use
  const authStore = useAuthStore();
  await authStore.checkAuth(); // 等待认证检查完成

  // 注册路由并挂载应用
  app.use(router);
  app.mount('#app');
}

// 调用启动函数
bootstrap();
