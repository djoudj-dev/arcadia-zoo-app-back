FROM node:18.19-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm ci && npm run build

FROM node:18.19-alpine3.19

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
