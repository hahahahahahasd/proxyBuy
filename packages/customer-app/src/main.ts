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
