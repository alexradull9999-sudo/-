# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ограничиваем использование памяти для Vite build
RUN node --max-old-space-size=400 ./node_modules/vite/bin/vite.js build

# Собираем серверную часть
RUN npx esbuild server.ts --bundle --platform=node --format=esm --outfile=dist/index.js --external:vite --minify

# Run stage
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "dist/index.js"]
