# Node Express Boilerplate

## 使用说明

## 开发流程

- 依赖：Node.js 20、pnpm（建议开启 corepack），本地需有 Docker。
- 启动数据库（dev profile 只起 Postgres）：`docker compose --profile dev up -d db`
- 准备环境变量：`.env` 中配置 `DATABASE_URL` 指向容器内数据库，例如 `postgresql://app:app@localhost:5432/node_express_boilerplate?schema=public`。
- 安装依赖：`pnpm install --frozen-lockfile`
- 初始化/同步数据库（按需选择其一）：
  - 迁移（推荐开发态）：`pnpm prisma migrate dev --name init`
  - 或仅推送模型：`pnpm prisma db push`
- 本地开发启动：`pnpm dev`（使用 `tsx watch src/server.ts`，连接刚才的容器数据库）

## 生产部署（Docker）

- 准备 `.env.docker`（包含 `DATABASE_URL` 等生产变量）。
- 构建镜像：`docker build -t node-express-boilerplate .`
- 单容器运行：`docker run --env-file .env.docker -p 8090:8090 node-express-boilerplate`
  - 容器入口会执行 `pnpm prisma migrate deploy`，需确保数据库可连通。
- 使用 docker-compose（包含 Postgres）：
  - `docker compose --profile prod up -d`
  - 应用暴露 `8090` 端口；数据库数据保存在卷 `postgres_data`。

## 关于 TypeScript 导入路径的说明

### 为什么使用 `.js` 而不是 `.ts` 扩展名？

在本项目中，你会看到所有的 import 语句都使用 `.js` 扩展名，例如：

```typescript
import { HttpError } from '../utils/httpError.js'
```

而不是：

```typescript
import { HttpError } from '../utils/httpError.ts' // ❌ 错误
```

**原因如下：**

1. **ES 模块规范要求**：本项目使用 ES 模块（`package.json` 中设置了 `"type": "module"`），ES 模块规范要求导入语句必须包含完整的文件扩展名。

2. **指向编译后的文件**：TypeScript 会将 `.ts` 文件编译成 `.js` 文件。导入路径中的扩展名应该对应编译后的文件类型，而不是源文件类型。

3. **NodeNext 模块解析**：项目使用了 `"moduleResolution": "NodeNext"`，这种模式遵循 Node.js 的 ES 模块解析规则，要求显式指定 `.js` 扩展名。

4. **运行时正确性**：编译后的代码在 Node.js 中运行时，实际加载的是 `.js` 文件，因此导入路径必须匹配运行时的实际文件。

**总结：** 虽然源文件是 `.ts`，但导入时必须写 `.js`，这是 TypeScript + ES 模块的标准做法。TypeScript 编译器会自动处理这种映射关系。
