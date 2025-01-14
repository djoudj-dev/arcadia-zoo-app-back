FROM node:18.19-alpine3.19 AS builder

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier les fichiers sources
COPY . .

# Construire le projet
RUN npm run build && \
    echo "=== Contenu après build ===" && \
    ls -la && \
    echo "=== Contenu du dossier dist/src ===" && \
    ls -la dist/src || true

FROM node:18.19-alpine3.19

WORKDIR /app

# Copier uniquement les fichiers nécessaires de l'étape builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./
COPY --from=builder /app/node_modules ./node_modules

# Vérification des fichiers copiés
RUN echo "=== Contenu final ===" && \
    ls -la && \
    echo "=== Contenu du dossier dist/src ===" && \
    ls -la dist/src || true

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/src/main"]
