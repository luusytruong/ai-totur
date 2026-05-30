FROM node:20-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/be ./apps/be
COPY packages/types ./packages/types

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/types build && pnpm --filter be build

FROM node:20-alpine AS production
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/be ./apps/be
COPY packages/types ./packages/types

RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000

CMD ["node", "apps/be/dist/server.js"]
