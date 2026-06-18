# AI 对话系统

## 项目概述
本项目是一个 AI 对话系统，包含前端 Web 应用和后端服务。前端基于 React + TypeScript 构建，提供友好的用户交互界面，实现聊天对话、消息历史查看等功能；后端使用 NestJS 框架，结合 MySQL 数据库，提供用户认证、聊天会话管理、智能对话等 API 服务，并集成阿里云百炼 AI 实现智能响应。

## 技术栈
### 前端
- **框架**：React 19、TypeScript
- **状态管理**：Redux Toolkit
- **UI 组件库**：Ant Design、Ant Design Pro Components
- **构建工具**：Vite
- **样式方案**：Tailwind CSS、UnoCSS
- **其他**：React Router DOM、React Markdown

### 后端
- **框架**：NestJS
- **数据库**：MySQL、TypeORM
- **AI 服务**：阿里云百炼（通过 OpenAI SDK 兼容模式）
- **认证**：JWT
- **文档**：Swagger

### 通用
- **通信**：EventSource 实现流式响应

## 项目结构
```plaintext
deepseek/
├── Dockerfile.backend     # 后端 Docker 镜像配置
├── Dockerfile.frontend    # 前端 Docker 镜像配置
├── docker-compose.yml     # 一键部署编排
├── docker.env.example     # Docker 环境变量示例
├── nginx.conf             # 前端 nginx 静态服务和 API 反代配置
├── server/               # 后端服务
│   ├── src/              # 源代码
│   ├── src/migrations/   # TypeORM 数据库迁移
│   ├── .env.development  # 开发环境配置
│   ├── package.json      # 依赖管理
│   └── ...
├── web/                  # 前端应用
│   ├── src/              # 源代码
│   ├── index.html        # 入口文件
│   ├── package.json      # 依赖管理
│   └── ...
├── .gitignore            # Git 忽略文件
└── ...
```

## Docker 一键部署

项目已补齐 Docker 部署配置，可通过 Docker Compose 一键启动 MySQL、NestJS 后端和 React 前端。

### 端口说明

- 前端页面：`http://localhost:8080/ai-chat/`
- 后端 Swagger：`http://localhost:3001/api-docs`
- MySQL：宿主机 `3307`，容器内 `3306`
- 前端 nginx 会把 `/api/` 反代到后端，并去掉 `/api` 前缀

### 环境变量

复制 Docker 环境变量示例文件，并按实际服务器配置修改：

```bash
cp docker.env.example docker.env
```

至少需要修改这些值：

```bash
MYSQL_ROOT_PASSWORD=change_me_strong_password
JWT_SECRET=change_me_at_least_32_characters_long
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=
```

如果启用登录页 reCAPTCHA，还需要配置：

```bash
RECAPTCHA_SITE_KEY=
VITE_APP_GOOGLE_RECAPTCHA_SITE_KEY=
```

### 启动

```bash
docker compose --env-file docker.env up -d --build
```

首次启动时，后端容器会自动执行 TypeORM migration，创建 `user`、`chat`、`message` 和 `typeorm_migrations` 表。

### 查看状态

```bash
docker compose --env-file docker.env ps
docker compose --env-file docker.env logs -f backend
```

### 停止

```bash
docker compose --env-file docker.env down
```

如果需要同时删除数据库数据卷：

```bash
docker compose --env-file docker.env down -v
```

