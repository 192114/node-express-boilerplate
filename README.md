# Node Express Boilerplate

一个基于 **Express 5 + TypeScript (ESM)** 的快速启动模板，内置 Prisma + PostgreSQL、完善的安全中间件、结构化日志与参数校验，开箱即用支持本地开发与 Docker 部署。

## 技术栈与特性

- **运行时**：Node.js 20、TypeScript ESM（`"type": "module"`，`moduleResolution: NodeNext`）
- **Web 框架**：Express 5，分层目录（路由/控制器/服务/中间件/Schema）
- **数据库**：PostgreSQL + Prisma ORM（生成客户端于 `generated/prisma`）
- **校验与安全**：Zod 参数校验、Helmet 安全头、CORS 自定义策略、速率限制（通用/严格）、请求体大小限制
- **日志**：pino / pino-http，按日写入 `logs/`，自动 request-id，健康检查静默
- **构建与工具链**：tsup 构建、tsx 热重载、ESLint + Prettier、husky + lint-staged
- **部署**：Dockerfile + docker-compose（dev/prod profiles），启动时执行迁移

## 环境要求

- Node.js 20+
- pnpm（建议开启 corepack）
- Docker（用于本地数据库或容器化部署）

## 快速开始（本地开发）

1. 克隆与安装

```bash
git clone <repository-url>
cd node-express-boilerplate
pnpm install --frozen-lockfile
```

2. 准备环境变量：创建 `.env`（见下方示例），确保数据库与 JWT 配置完整
3. 启动数据库（dev profile 仅包含 Postgres）

```bash
docker compose --profile dev up -d db
```

4. 初始化数据库（无需 `prisma init`，已提供迁移）

```bash
pnpm prisma migrate dev
```

- 应用全部迁移并生成 Prisma Client

5. 启动开发服务器（监听 `.ts`）

```bash
pnpm dev
```

## 环境变量说明

核心变量（详见 `src/config/env.schema.ts`，Zod 校验不通过会抛错）：

| 变量                     | 说明                              | 默认值        |
| ------------------------ | --------------------------------- | ------------- |
| `NODE_ENV`               | `development`/`production`/`test` | `development` |
| `API_PORT`               | API 端口                          | `8090`        |
| `API_PREFIX`             | 路由前缀                          | `/api`        |
| `POSTGRES_HOST`          | 数据库主机                        | 必填          |
| `POSTGRES_PORT`          | 数据库端口                        | `5432`        |
| `POSTGRES_DB`            | 数据库名称                        | 必填          |
| `POSTGRES_APP_USER`      | 应用用户                          | 必填          |
| `POSTGRES_APP_PASSWORD`  | 应用用户密码                      | 必填          |
| `JWT_SECRET`             | 访问令牌密钥（≥32 字符）          | 必填          |
| `JWT_EXPIRES_IN`         | 访问令牌过期                      | `7d`          |
| `JWT_REFRESH_SECRET`     | 刷新令牌密钥（≥32 字符）          | 必填          |
| `JWT_REFRESH_EXPIRES_IN` | 刷新令牌过期                      | `30d`         |
| `REDIS_URL`              | 可选 Redis 连接（当前未强依赖）   | 可选          |
| `CORS_ORIGIN`            | `*` 或逗号分隔 URL 列表           | `*`           |

`.env` 示例：

```env
NODE_ENV=development
API_PORT=8090
API_PREFIX=/api

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=node_express_boilerplate
POSTGRES_APP_USER=app
POSTGRES_APP_PASSWORD=app

JWT_SECRET=abcdefghijklmnopqrstuvwxyz123456
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=abcdefghijklmnopqrstuvwxyz123456
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:3000
```

## 目录结构速览

```
src/
  config/         # 环境加载与校验
  routes/         # 路由定义（health/auth）
  controllers/    # 控制器层
  services/       # 业务逻辑
  middlewares/    # 安全、日志、验证、错误处理
  schemas/        # Zod 校验 Schema
  database/       # Prisma 客户端初始化
  utils/          # 工具与响应封装
prisma/           # 数据模型与迁移
db/init/          # Postgres 初始化脚本（角色/权限）
logs/             # 按日落盘的 pino 日志
```

## 常用脚本

- `pnpm dev`：开发模式（`tsx watch src/server.ts`）
- `pnpm build`：使用 tsup 构建到 `dist/`
- `pnpm start`：运行编译产物 `dist/server.js`
- `pnpm lint` / `pnpm lint:fix`：ESLint 检查/修复
- `pnpm format` / `pnpm format:check`：Prettier 格式化/检查
- `pnpm prisma migrate dev`：开发迁移（含生成客户端）
- `pnpm prisma migrate deploy`：生产迁移（在容器入口脚本中调用）

## 数据库与 Prisma

- 模型与迁移位于 `prisma/`；生成客户端输出到 `generated/prisma`
- 本地迁移：`pnpm prisma migrate dev`
- 生产迁移：`pnpm prisma migrate deploy`（Docker 启动时会执行）
- 连接配置由 `src/config/index.ts` 组合 env 变量生成

## API 摘要（默认前缀 `${API_PREFIX}`）

- 健康检查
  - `GET /health/live`：存活探针
  - `GET /health/ready`：就绪探针（会触发一次数据库可用性检查）
- 认证
  - `POST /auth/register`：`{ username, password, email, emailCode(6位), emialUuid(UUID) }`
  - `POST /auth/login`：`{ username, password }`
  - 两个接口均使用严格限流 `strictLimiter`（5 次/15 分钟，成功不计数）与 Zod 体校验
- 响应格式（成功）：`{ code, data, message }`；错误通过 `HttpError` 返回业务码与描述

## 安全与中间件

- `helmetMiddleware`：CSP/HSTS/Referrer-Policy 等，生产环境更严格
- `corsConfig`：支持通配或白名单，开发默认放行
- `apiLimiter` / `strictLimiter`：速率限制，按 IP + username 组合键
- 请求体限制：JSON/URL-Encoded 默认 10MB
- `httpLoggerMiddleware`：pino-http，自动 request-id，健康探针不记录
- `errorMiddleware`：区分业务错误（4xx）与系统错误（5xx），生产屏蔽堆栈

## 构建与部署

- 本地构建与运行
  ```bash
  pnpm build
  pnpm start
  ```
  需确保 `.env` 与数据库可用。
- Docker 单容器
  ```bash
  docker build -t node-express-boilerplate .
  docker run --env-file .env.docker -p 8090:8090 node-express-boilerplate
  ```
  入口脚本会执行 `pnpm prisma migrate deploy`，请保证数据库连通。
- docker-compose（含 Postgres）
  ```bash
  docker compose --profile prod up -d
  ```
  API 暴露 `8090`，数据卷 `postgres_data`。

## 关于 TypeScript 导入路径的说明

项目采用 ES 模块与 `NodeNext` 解析规则，导入时需写 `.js` 扩展名，指向编译后的文件。例如：

```typescript
import { HttpError } from '../utils/httpError.js' // 正确
// import { HttpError } from '../utils/httpError.ts' // 错误
```

这是 ESM 与编译产物路径一致性的要求，TypeScript 编译器会处理 `.ts` 到 `.js` 的映射。
