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
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/
RUN npm install --omit=dev && mkdir -p /app/uploads

# Définir le volume pour les uploads
VOLUME ["/app/uploads"]

EXPOSE 3000
CMD ["node", "dist/main.js"]
