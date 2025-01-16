FROM node:20.12-alpine3.19

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN npm ci && npm run build

FROM node:20.12-alpine3.19

WORKDIR /dist/src

# Création des dossiers pour les uploads
RUN mkdir -p uploads/habitats uploads/animals uploads/services

EXPOSE 3000
# Commande de démarrage
CMD ["npm", "run", "start:prod"]
