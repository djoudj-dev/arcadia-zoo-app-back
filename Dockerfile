# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du reste du code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production uniquement
RUN npm ci --only=production

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=builder /app/dist ./dist

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
