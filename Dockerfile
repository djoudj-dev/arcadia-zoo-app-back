# Étape 1 : Construction de l'application
FROM node:18-alpine AS builder
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY src/ ./src/

# Construire l'application
RUN npm run build

# Étape 2 : Image finale pour exécution
FROM node:18-alpine
WORKDIR /app

# Installation et configuration initiale
RUN apk add --no-cache netcat-openbsd && \
    mkdir -p /var/www/html/storage/app/ssh/keys && \
    chmod -R 777 /var/www/html/storage

# Copier les fichiers de configuration
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/

# Installer les dépendances et créer les répertoires
RUN npm ci --only=production && \
    mkdir -p uploads/animals uploads/habitats uploads/services

# Créer un volume pour le stockage persistant
VOLUME ["/var/www/html/storage", "/app/uploads"]

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "dist/main.js"]
