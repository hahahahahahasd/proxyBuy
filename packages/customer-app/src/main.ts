import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/css/variable.css'
import '@/assets/css/common.css'
import '@/assets/css/reset.css'
import '@/assets/css/flex.css'

// 1. 引入你需要的 Vant 组件
import { 
  NavBar, 
  Card, 
  Stepper, 
  SubmitBar, 
  Icon, 
  Cell, 
  CellGroup, 
  Dialog,
  Notify,
  Loading,
  Search,
  Button,
  Sidebar,
  SidebarItem,
  Popup,
  Tag,
  Field,
  Area,
  IndexBar,      // <-- 新增
  IndexAnchor,   // <-- 新增
  List,          // <-- 新增(之前未显式注册，最佳实践是补上)
  Empty          // <-- 新增(之前未显式注册，最佳实践是补上)
} from 'vant';

// 2. 引入 Vant 全局样式
import 'vant/lib/index.css';

// --- 新增：从 URL 获取 Token ---
// 在 Vue 应用初始化之前，检查 URL 中是否有 token 参数
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  // 如果存在，则将其保存到 localStorage
  localStorage.setItem('token', token);

  // 为了安全和美观，从 URL 中移除 token 参数，避免被用户收藏或分享
  // 使用 replaceState 不会触发页面刷新
  const newUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, newUrl);
}
// --- 结束新增逻辑 ---

const app = createApp(App)

// 3. 注册你需要的 Vant 组件
app.use(NavBar);
app.use(Card);
app.use(Stepper);
app.use(SubmitBar);
app.use(Icon);
app.use(Cell);
app.use(CellGroup);
app.use(Dialog);
app.use(Notify);
app.use(Loading);
app.use(Search);
app.use(Button);
app.use(Sidebar);
app.use(SidebarItem);
app.use(Popup);
app.use(Tag);
app.use(Field);
app.use(Area);
app.use(IndexBar);     // <-- 新增
app.use(IndexAnchor);  // <-- 新增
app.use(List);         // <-- 新增
app.use(Empty);        // <-- 新增


app.use(createPinia())
app.use(router)

app.mount('#app')
