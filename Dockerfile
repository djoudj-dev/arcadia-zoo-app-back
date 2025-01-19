FROM node:20.12-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Build et préparation des templates
RUN npm ci && npm run build && \
    mkdir -p /app/dist/modules/mail/templates && \
    cp -r /app/src/modules/mail/templates/* /app/dist/modules/mail/templates/

FROM node:20.12-alpine3.19

WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Création des répertoires nécessaires
RUN mkdir -p /app/uploads/animals && \
    mkdir -p /app/uploads/habitats && \
    mkdir -p /app/uploads/services && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/uploads

USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
