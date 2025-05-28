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
├── server/               # 后端服务
│   ├── src/              # 源代码
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
