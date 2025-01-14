FROM node:20.12-alpine3.19 AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20.12-alpine3.19

WORKDIR /dist/src

COPY --from=builder /build/package*.json ./
COPY --from=builder /build/dist/src .
COPY --from=builder /build/node_modules ../node_modules

EXPOSE 3000
CMD ["node", "main.js"]
