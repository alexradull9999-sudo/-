# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Увеличиваем лимит памяти для стабильной сборки
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Run stage
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
# Timeweb Cloud обычно использует переменную PORT
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
