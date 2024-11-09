# Étape 1 : Utiliser Node.js pour construire le projet NestJS
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste des fichiers et compiler
COPY . .
RUN npm run build

# Créer et définir les permissions des dossiers d'upload
RUN mkdir -p /app/uploads/animals /app/uploads/habitats /app/uploads/services \
    && chown -R node:node /app/uploads

# Étape 2 : Utiliser une image légère et déployer les fichiers compilés
FROM node:18-alpine

# Définir le répertoire de déploiement sur le serveur
WORKDIR /var/www/nedellec-julien.fr/backend

# Installer les dépendances de production uniquement
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copier les fichiers compilés de l'étape de construction
COPY --from=build /app/dist/arcadia-zoo-app-back .

# Exposer le port pour NestJS
EXPOSE 3000

# Lancer l'application NestJS
CMD ["node", "dist/arcadia-zoo-app-back/main"]
