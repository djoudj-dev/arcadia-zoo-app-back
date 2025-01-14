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

ARG UPLOAD_PATH=/app/uploads
RUN mkdir -p ${UPLOAD_PATH} && chown -R node:node ${UPLOAD_PATH}
VOLUME ${UPLOAD_PATH}

EXPOSE 3000
CMD ["node", "dist/main.js"]
