# Étape 1 : Construction de l'application
FROM node:18-alpine AS builder
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application NestJS
RUN npm run build

# Étape 2 : Image finale pour exécution
FROM node:18-alpine
WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --only=production

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "dist/main.js"]
