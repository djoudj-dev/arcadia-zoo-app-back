# Zoo Arcadia - Guide d'Installation

Zoo Arcadia est un backend performant et modulaire construit avec NestJS. Il fournit une base robuste pour gérer les données d'un parc zoologique, avec des fonctionnalités avancées comme l'authentification, la gestion des utilisateurs, et le traitement des fichiers uploadés.

## Prérequis

- Node.js (v16 ou supérieur)
- npm (v8 ou supérieur)
- PostgreSQL (base de données relationnelle principale)
- MongoDB (pour des fonctionnalités spécifiques, comme les commentaires)
- Git (pour cloner le projet)

# 🏁 Pour l'installation suivre les consigne suivante

### 1- Cloner le projet

```bash
git clone https://github.com/djoudj-dev/arcadia-zoo-app-back.git
```

### 2- Installer les dépendances

```bash
npm install
```

### 3 - Configuration des variables d'environnement

```bash
# Base de données PostgreSQL
POSTGRES_URL=postgresql://username:password@localhost:5432/arcadia_db

# Base de données MongoDB
MONGO_URL=mongodb://localhost:27017/arcadia_db

# JWT
JWT_SECRET=your-jwt-secret

# CORS
CORS_ORIGIN=http://localhost:4200
```

### 4 - Création des dossiers nécessaires

Le projet créera automatiquement les dossiers suivants au démarrage (comme indiqué dans le fichier main.ts) :

uploads/animals : Pour les images des animaux
uploads/habitats : Pour les images des habitats
uploads/services : Pour les images des services

### 5 - Lancer le projet en développement

```bash
npm run start:dev
```

# 🏗️ Structure du Projet

Le projet suit une architecture modulaire NestJS pour faciliter la maintenance et l'extensibilité :

- src/modules/ : Contient tous les modules fonctionnels de l'application.
- src/config/ : Gère la configuration des bases de données et des services.
- src/auth/ : Gère l'authentification et les autorisations.
- uploads/ : Stocke les fichiers uploadés (images des animaux, habitats, services).

# 🗄️ Bases de Données

Le projet utilise deux bases de données :

- PostgreSQL : Pour les données principales (utilisateurs, animaux, habitats, services, etc.).
- MongoDB : Pour certaines fonctionnalités spécifiques, comme :
  Les commentaires des utilisateurs
  Les rapports vétérinaires
