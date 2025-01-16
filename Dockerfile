FROM node:20.12-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN npm ci && npm run build \
    && mkdir -p dist/src/modules/mail/templates \
    && cp -r src/modules/mail/templates dist/src/modules/mail/

FROM node:20.12-alpine3.19

WORKDIR /app

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Création des dossiers pour les uploads
RUN mkdir -p uploads/habitats uploads/animals uploads/services

ENV NODE_ENV=production

EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
