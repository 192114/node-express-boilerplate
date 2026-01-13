# syntax=docker/dockerfile:1.6

############################
# 1. base - 基础环境准备
############################
FROM node:20-alpine AS base

WORKDIR /app

# 设置 pnpm 环境变量
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g pnpm@10.11.1

############################
# 2. deps - 安装依赖
############################
FROM base AS deps

# 复制依赖定义文件
COPY package.json pnpm-lock.yaml ./
# 同时也需要复制 prisma 目录，因为 pnpm install 可能会触发 prisma generate
COPY prisma ./prisma/

# 安装所有依赖
RUN pnpm install --frozen-lockfile

############################
# 3. build - 构建应用
############################
FROM base AS build

# 关键：设置构建时环境变量占位符
# 这些变量在 build 阶段只是为了通过 Prisma 的校验，不会被打包进最终运行逻辑
ENV POSTGRES_OWNER_USER=placeholder
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV POSTGRES_OWNER_PASSWORD=placeholder

# 从 deps 阶段拷贝依赖
COPY --from=deps /app/node_modules ./node_modules
# 拷贝所有源代码
COPY . .

# 生成 Prisma Client (会根据你的 schema 生成到 /app/generated/prisma)
RUN pnpm prisma generate

# 执行项目打包
RUN pnpm run build

############################
# 4. runner - 运行环境
############################
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境标识
ENV NODE_ENV=production

# 运行时也需要 pnpm 执行 migrate 命令
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g pnpm@10.11.1

# A. 拷贝生产环境所需的 node_modules
COPY --from=deps /app/node_modules ./node_modules

# B. 拷贝构建后的代码
COPY --from=build /app/dist ./dist

# C. ⚠️ 关键：拷贝自定义生成的 Prisma Client 
# 对应你 schema.prisma 里的 output = "../generated/prisma"
COPY --from=build /app/generated ./generated

# D. 拷贝 prisma 定义文件（migrate 部署时需要）
COPY prisma ./prisma

# 暴露端口（变量需在运行时通过 -e 或 env_file 传入）
EXPOSE ${API_UPSTREAM_PORT}

# 启动脚本：先运行数据库迁移，再启动服务
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/server.js"]
