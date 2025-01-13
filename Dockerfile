FROM node:18-alpine AS builder
WORKDIR /app

# Copier les fichiers nécessaires et installer les dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm install

# Copier le code source et construire l'application
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'exécution
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/
RUN npm install --omit=dev && mkdir -p /app/uploads

# Exposer le port de l'application
EXPOSE 3000

# Démarrer l'application
CMD ["node", "dist/main.js"]
