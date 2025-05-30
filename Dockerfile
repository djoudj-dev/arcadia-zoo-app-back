# Étape 1 : Construction de l'application en utilisant une image Node.js Alpine légère
FROM node:20.12-alpine3.19 AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de configuration nécessaires pour la gestion des dépendances
COPY package*.json ./
COPY tsconfig*.json ./

# Copier le code source de l'application dans le conteneur
COPY src ./src

# Installation des dépendances et construction du projet
RUN npm install --legacy-peer-deps && npm run build && \
    # Création du répertoire de destination pour les templates d'e-mails
    mkdir -p /app/dist/modules/mail/templates && \
    # Copier les templates d'e-mails du dossier source vers le dossier de build
    cp -r /app/src/modules/mail/templates/* /app/dist/modules/mail/templates/

# Étape 2 : Création de l'image finale optimisée pour l'exécution
FROM node:20.12-alpine3.19

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de construction précédente
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules  
COPY --from=builder /app/package*.json ./  

# Création des répertoires nécessaires pour le stockage des fichiers
RUN mkdir -p /app/uploads/animals && \
    mkdir -p /app/uploads/habitats && \
    mkdir -p /app/uploads/services && \
    # Définition des permissions et propriétaire des fichiers pour éviter les problèmes d'accès
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/uploads  

# Exécuter le conteneur en tant qu'utilisateur non-root pour des raisons de sécurité
USER node

# Définition de l'environnement en mode production
ENV NODE_ENV=production

# Exposition du port 3000 pour l'application
EXPOSE 3000

# Commande de démarrage de l'application en mode production
CMD ["npm", "run", "start:prod"]

