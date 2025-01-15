FROM node:20.12-alpine3.19 AS builder

# Ajout des dépendances de build pour bcrypt
RUN apk add --no-cache g++ make python3

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20.12-alpine3.19

WORKDIR /dist/src

# Installation des outils pour le healthcheck et bcrypt
RUN apk add --no-cache curl g++ make python3 wget

COPY --from=builder /build/package*.json ./
COPY --from=builder /build/dist/src .
COPY --from=builder /build/node_modules ../node_modules

EXPOSE 3000
CMD ["node", "main.js"]
