FROM node:20-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

ARG API_URL=http://api:3000/api
ENV API_URL=${API_URL}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/fe ./apps/fe
COPY packages/types ./packages/types

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/types build && pnpm --filter fe build

FROM node:20-alpine AS production
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

ARG API_URL=http://api:3000/api
ENV API_URL=${API_URL}

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/fe ./apps/fe
COPY packages/types ./packages/types

COPY --from=builder /repo/apps/fe/.next ./apps/fe/.next
COPY --from=builder /repo/packages/types/dist ./packages/types/dist

RUN pnpm install --frozen-lockfile --prod

EXPOSE 80

CMD ["pnpm", "--filter", "fe", "start"]