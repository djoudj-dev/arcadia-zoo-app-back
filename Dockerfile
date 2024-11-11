# Étape 1 : Construire l'application avec Node.js
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration npm
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source de l'application
COPY . .

# Exécuter la construction de l'application NestJS
RUN npm run build

# Créer des répertoires d'upload
RUN mkdir -p /app/uploads/animals /app/uploads/habitats /app/uploads/services && \
    chown -R node:node /app/uploads

# Étape 2 : Déploiement avec une image légère
FROM node:18-alpine

# Définir le répertoire de déploiement
WORKDIR /var/www/nedellec-julien.fr/backend

# Installer les dépendances de production uniquement
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copier les fichiers générés par l'étape de construction
COPY --from=build /app/dist/arcadia-zoo-app-back .

# Exposer le port de l'application
EXPOSE 3000

# Lancer l'application NestJS
CMD ["node", "dist/arcadia-zoo-app-back/main.js"]
