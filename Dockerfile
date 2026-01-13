# syntax=docker/dockerfile:1.6

############################
# base
############################
FROM node:20-alpine AS base

WORKDIR /app

# pnpm 环境变量
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 🚨 不使用 corepack 自动下载
# 直接指定 npm registry + 全局安装 pnpm
RUN npm config set registry https://registry.npmmirror.com \
 && npm install -g pnpm@10.11.1

############################
# deps
############################
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

# 只装依赖（利用缓存）
RUN pnpm install --frozen-lockfile

############################
# build
############################
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

############################
# runner
############################
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# ⚠️ 运行时不需要 pnpm registry
# 但需要 pnpm 命令（用于 prisma migrate）
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 只拷贝运行所需内容
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

EXPOSE ${API_UPSTREAM_PORT}

CMD ["sh", "-c", "pnpm run prisma:migrate-deploy && node dist/server.js"]
