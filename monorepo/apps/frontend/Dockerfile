FROM node:20-alpine as builder
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --filter=frontend

COPY apps/frontend ./apps/frontend

ARG VUE_APP_API_URL
ENV NODE_ENV=production

RUN pnpm turbo build --filter=frontend

# ---------- этап сервинга ----------
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
