FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/
RUN npm install --omit=dev && \
    mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app/uploads

USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
