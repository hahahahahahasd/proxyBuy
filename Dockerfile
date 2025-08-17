# --- STAGE 1: DEPS ---
# 安装所有依赖，包括 devDependencies，用于后续的构建
FROM node:18-bullseye AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps



# --- STAGE 2: BUILDER ---
# 在这个阶段进行编译
FROM node:18-bullseye AS builder
WORKDIR /usr/src/app
# 从 deps 阶段拷贝完整的 node_modules
COPY --from=deps /usr/src/app/node_modules ./node_modules
# 拷贝所有源代码
COPY . .
# 运行 Prisma Generate 和 Build
# 此时因为有完整的 node_modules，所有 TS 模块都能被找到
RUN npx prisma generate
RUN npm run build

# --- STAGE 3: PRODUCTION ---
# This is the final image that will be run, it will be much smaller
FROM node:18-bullseye AS production
WORKDIR /usr/src/app
# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/package*.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy the compiled code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
# The prisma schema file is needed at runtime
COPY --from=builder /usr/src/app/src/prisma ./prisma
# Copy static assets
COPY --from=builder /usr/src/app/public ./public
# Copy entrypoint and wait-for-it scripts
COPY ./entrypoint.sh ./
COPY ./wait-for-it.sh ./
# Grant execution permissions
RUN chmod +x ./entrypoint.sh ./wait-for-it.sh

EXPOSE 3000
# The final command to run
CMD ["node", "dist/main"]