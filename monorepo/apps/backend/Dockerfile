FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter=backend
COPY apps/backend ./apps/backend


FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pm2

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/apps/backend ./apps/backend
COPY --from=builder --chown=appuser:appgroup /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser
EXPOSE 5000

CMD ["pm2-runtime", "start", "apps/backend/ecosystem.config.cjs"]
# CMD ["sh", "-c", "sleep infinity"]


