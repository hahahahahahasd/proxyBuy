# 使用官方 Node.js 镜像
FROM node:20

# 设置工作目录
WORKDIR /usr/src/app

# 先复制 package 文件以利用 Docker 缓存
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/customer-app/package*.json ./packages/customer-app/

# 安装依赖
RUN npm install

# 复制项目其它文件
COPY . .

# 生成 Prisma 客户端（若使用 Prisma）
RUN npx prisma generate --schema=./packages/backend/src/prisma/schema.prisma

# 构建后端
WORKDIR /usr/src/app/packages/backend
RUN npm run build
WORKDIR /usr/src/app

# 复制 public 目录到后端应用中
RUN cp -r public packages/backend/public

# 暴露运行端口
EXPOSE 3000

# 容器启动命令（启动已构建的后端）
CMD ["node", "packages/backend/dist/main"]