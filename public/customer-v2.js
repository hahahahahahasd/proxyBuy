const { createApp, ref, onMounted, computed } = Vue;

const app = createApp({
  setup() {
    // --- 响应式数据 ---
    const activeCategory = ref(0);
    const categories = ref([]); // 分类和菜品数据
    const cart = ref({}); // 购物车, 格式: { menuItemId: quantity }
    const showCart = ref(false);
    const menuContainer = ref(null); // 用于滚动定位
    const showAddressPopup = ref(false);
    const searchKeyword = ref('');

    // --- 模拟门店数据 ---
    const storeList = ref([
      { id: 1, name: '广州天河城店', address: '广东省广州市天河区天河路208号', distance: '800m' },
      { id: 2, name: '深圳海岸城店', address: '广东省深圳市南山区文心五路33号', distance: '1.2km' },
      { id: 3, name: '北京三里屯店', address: '北京市朝阳区三里屯路19号', distance: '2.5km' },
      { id: 4, name: '上海正大广场店', address: '上海市浦东新区陆家嘴西路168号', distance: '500m' },
      { id: 5, name: '成都太古里店', address: '四川省成都市锦江区中纱帽街8号', distance: '3.1km' },
    ]);
    const selectedStore = ref(storeList.value[0]); // 默认选择第一家

    const merchantId = 1; // 示例商户ID

    // --- 计算属性 ---
    const totalItems = computed(() => {
      return Object.values(cart.value).reduce((sum, quantity) => sum + quantity, 0);
    });

    const cartItems = computed(() => {
      const items = [];
      for (const category of categories.value) {
        for (const item of category.items) {
          if (cart.value[item.id] > 0) {
            items.push(item);
          }
        }
      }
      return items;
    });

    const totalPrice = computed(() => {
      let total = 0;
      for (const category of categories.value) {
        for (const item of category.items) {
          if (cart.value[item.id]) {
            total += item.price * cart.value[item.id];
          }
        }
      }
      return total;
    });

    const filteredStoreList = computed(() => {
      if (!searchKeyword.value) {
        return storeList.value;
      }
      return storeList.value.filter(store => 
        store.name.includes(searchKeyword.value) || store.address.includes(searchKeyword.value)
      );
    });

    // --- 方法 ---
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/merchants/${merchantId}/menu`);
        const menuItems = await response.json();
        
        const hotItems = menuItems.slice(0, 3);
        const mainCourse = menuItems.filter(item => item.name.includes('饭') || item.name.includes('面'));
        const drinks = menuItems.filter(item => item.name.includes('茶') || item.name.includes('汁'));
        const others = menuItems.filter(item => !mainCourse.includes(item) && !drinks.includes(item) && !hotItems.includes(item));

        categories.value = [
          { id: 'hot', name: '热销推荐', items: hotItems },
          { id: 'main', name: '主食', items: mainCourse },
          { id: 'drinks', name: '饮品', items: drinks },
          { id: 'others', name: '其他', items: others },
        ].filter(cat => cat.items.length > 0);

        menuItems.forEach(item => {
          cart.value[item.id] = 0;
        });

      } catch (error) {
        console.error('获取菜单失败:', error);
        vant.showNotify({ type: 'danger', message: '菜单加载失败，请稍后重试' });
      }
    };

    const onCategoryChange = (index) => {
      const categoryId = categories.value[index].id;
      const el = document.querySelector(`[ref='category-${categoryId}']`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    const updateCart = (item, quantity) => {
      cart.value[item.id] = quantity;
    };

    const clearCart = () => {
      Object.keys(cart.value).forEach(key => {
        cart.value[key] = 0;
      });
      showCart.value = false;
    };

    const onSubmit = async () => {
      if (totalItems.value === 0) {
        vant.showNotify({ type: 'warning', message: '购物车是空的哦' });
        return;
      }

      const orderItems = Object.entries(cart.value)
        .filter(([_, quantity]) => quantity > 0)
        .map(([menuItemId, quantity]) => ({
          menuItemId: parseInt(menuItemId),
          quantity,
        }));

      try {
        const response = await fetch('/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId: merchantId,
            tableId: 1, // 示例桌号
            items: orderItems,
          }),
        });

        if (!response.ok) throw new Error('订单创建失败');
        
        const order = await response.json();
        vant.showNotify({ type: 'success', message: `下单成功！订单号: ${order.id}` });
        clearCart();
        
      } catch (error) {
        console.error('下单失败:', error);
        vant.showNotify({ type: 'danger', message: '下单失败，请稍后重试' });
      }
    };

    const onAddressClick = () => {
      showAddressPopup.value = true;
    };

    const onSelectStore = (store) => {
      selectedStore.value = store;
      showAddressPopup.value = false;
    };

    // --- 生命周期钩子 ---
    onMounted(() => {
      fetchMenu();
    });

    // --- 返回给模板 ---
    return {
      activeCategory,
      categories,
      cart,
      showCart,
      menuContainer,
      totalItems,
      cartItems,
      totalPrice,
      showAddressPopup,
      searchKeyword,
      filteredStoreList,
      selectedStore,
      onCategoryChange,
      updateCart,
      clearCart,
      onSubmit,
      onAddressClick,
      onSelectStore,
    };
  }
});

// 挂载 Vant 组件和 Vue 应用
app.use(vant);
app.mount('#app');
