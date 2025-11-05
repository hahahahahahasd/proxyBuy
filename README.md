# 支付人-老板助手 SaaS 系统 MVP Demo

这是一个基于 NestJS, Prisma, PostgreSQL 和 WebSocket 的轻量级代下单SaaS系统基础Demo。

## 技术栈

- **后端**: NestJS
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **实时通信**: WebSocket (NestJS Gateway)
- **环境**: Docker & docker-compose

## 启动指南

### 1. 先决条件

- 已安装 [Docker](https://www.docker.com/get-started) 和 Docker Compose。

### 2. 配置环境变量

将项目根目录下的 `.env.example` 文件复制一份并重命名为 `.env`。

```bash
cp .env.example .env
```

`.env` 文件中的默认配置已为 docker-compose 环境设置好，通常无需修改。

### 3. 构建并启动服务

在项目根目录下，执行以下命令：

```bash
docker-compose up --build
```

该命令会：
- 拉取 PostgreSQL 镜像并创建一个数据库容器。
- 构建后端 NestJS 应用的 Docker 镜像。
- 在镜像构建过程中，自动安装依赖、生成 Prisma Client、将数据库 schema 推送到数据库、并执行数据填充（seed）。
- 启动后端服务。

服务启动后，后端 API 将在 `http://localhost:3001` 上可用。

## 如何使用 Demo

项目启动后，会自动创建一些种子数据（1个商户，3个餐桌，5个菜单项）。

### 1. 顾客端

打开浏览器，访问以下地址来模拟在**商户1**的**2号桌**点餐：

[http://localhost:3001/customer.html?merchantId=1&tableId=2](http://localhost:3001/customer.html?merchantId=1&tableId=2)

- 页面会自动加载该商户的菜单。
- 选择菜品，点击“下单”。
- 在模拟支付页面，点击“确认支付”。

### 2. 商户端

在另一个浏览器窗口或标签页中，访问以下地址来模拟**商户1**的后台：

[http://localhost:3001/merchant.html?merchantId=1](http://localhost:3001/merchant.html?merchantId=1)

- 页面会建立 WebSocket 连接。
- 当顾客端完成支付后，新订单会实时推送到此页面，并伴有提示音。
- 商户可以点击按钮更新订单状态，状态会实时同步。


swag 

http://localhost:3000/api/