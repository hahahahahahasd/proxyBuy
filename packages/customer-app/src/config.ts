// src/config.ts
// 从 Vite 的环境变量中获取 API 的基地址
// 在开发环境中，这将是 '/api'，Vite 会代理它
// 在生产环境中，构建后的代码也会使用 '/api'，Nginx 会代理它
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';