# Étape 1 : Construction de l'application en utilisant une image Node.js Alpine légère
FROM node:20.12-alpine3.19 AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer les outils nécessaires pour la connectivité réseau et la compilation
RUN apk add --no-cache \
    curl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && update-ca-certificates

# Copier les fichiers de configuration nécessaires pour la gestion des dépendances
COPY package*.json ./
COPY tsconfig*.json ./

# Copier le code source de l'application dans le conteneur
COPY src ./src

# Installation des dépendances et construction du projet
RUN npm install --legacy-peer-deps && npm run build
# Préparer les templates d'e-mails dans le dossier de build
RUN mkdir -p /app/dist/modules/mail/templates && cp -r /app/src/modules/mail/templates/* /app/dist/modules/mail/templates/

# Étape 2 : Création de l'image finale optimisée pour l'exécution
FROM node:20.12-alpine3.19

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer les packages nécessaires pour la connectivité S3 et la sécurité
RUN apk add --no-cache \
    curl \
    ca-certificates \
    dumb-init \
    && update-ca-certificates

# Copier les fichiers nécessaires depuis l'étape de construction précédente
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Configuration optimisée pour S3 uniquement
# NOTE: Skipping DNS tweak; /etc/resolv.conf is read-only in some environments (e.g., Coolify/CNI),
# and Node is already configured with ipv4first via NODE_OPTIONS.
# Définition des permissions et propriétaire des fichiers
RUN chown -R node:node /app && chmod -R 755 /app

# Exécuter le conteneur en tant qu'utilisateur non-root pour des raisons de sécurité
USER node

# Définition de l'environnement en mode production avec optimisations S3
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048 --dns-result-order=ipv4first" \
    UV_THREADPOOL_SIZE=128

# Exposition du port 3000 pour l'application
EXPOSE 3000

# Health check pour vérifier que l'application répond (inclut la vérification du proxy d'images)
HEALTHCHECK --interval=30s --timeout=15s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/images/health || exit 1

# Commande de démarrage de l'application en mode production avec dumb-init pour une meilleure gestion des processus
CMD ["dumb-init", "node", "dist/main.js"]

