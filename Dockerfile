# syntax=docker/dockerfile:1

# ベースイメージ（Debian系でOpenSSL互換性を確保）
FROM node:20-slim AS base

# 依存関係インストール用ステージ
FROM base AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 依存関係をインストール
RUN npm ci

# Prisma Clientを生成
RUN npx prisma generate

# ビルド用ステージ
FROM base AS builder
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数（ビルド時）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Next.jsをビルド
RUN npm run build

# 本番用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# OpenSSLをインストール（Prisma用）
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# セキュリティ: 非rootユーザーで実行
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Next.js standaloneモードの出力をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma Clientをコピー
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# SQLiteデータディレクトリを作成
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
