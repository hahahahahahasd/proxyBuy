import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 将所有 /socket.io 的请求代理到后端
      '/socket.io': {
        target: 'http://localhost:3000', // 后端地址
        ws: true, // 必须开启 WebSocket 代理
        changeOrigin: true,
      },
      // 将 /api 请求代理到后端的 3000 端口
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 重写路径，去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
