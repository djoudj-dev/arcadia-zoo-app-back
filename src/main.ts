import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

// Création du dossier uploads principal.
const uploadBasePath = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadBasePath)) {
  fs.mkdirSync(uploadBasePath);
}

// Création des sous-dossiers
const uploadDirs = ['uploads/animals', 'uploads/habitats', 'uploads/services'];

uploadDirs.forEach((dir) => {
  const fullPath = join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Création du dossier public pour les fichiers statiques
const publicDir = join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Ajoutez après la création des dossiers uploads
const templateDir = join(process.cwd(), 'dist/modules/mail/templates');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// Copier les fichiers templates depuis src vers dist
const srcTemplateDir = join(process.cwd(), 'src/modules/mail/templates');
if (fs.existsSync(srcTemplateDir)) {
  const files = fs.readdirSync(srcTemplateDir);
  files.forEach((file) => {
    const srcPath = join(srcTemplateDir, file);
    const destPath = join(templateDir, file);
    fs.copyFileSync(srcPath, destPath);
  });
}

async function bootstrap() {
  console.log('Starting application...');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log('NestJS application created');

  // Middleware de logging pour déboguer
  app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to: ${req.url}`);
    next();
  });

  // Middleware pour les en-têtes de sécurité
  app.use((req, res, next) => {
    res.header(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' " +
        'https://*.googleapis.com https://*.gstatic.com https://maps.google.com; ' +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://api.nedellec-julien.fr; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
        "frame-src 'self' https://www.google.com/ https://*.google.com; " +
        "connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://cdnjs.cloudflare.com https://api.nedellec-julien.fr; " +
        "worker-src 'self' blob:; " +
        "child-src 'self' blob: https://*.google.com; " +
        "object-src 'none'",
    );

    res.header('Storage-Access-Policy', 'unpartitioned-storage');
    res.header('Partitioned-Cookie', 'none');

    next();
  });

  // Convertir la chaîne de domaines en tableau
  const corsOrigins = process.env.CORS_ORIGIN?.split(',');
  console.log('CORS Origins:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'Partitioned-Cookie',
      'Storage-Access-Policy',
    ],
    exposedHeaders: ['Storage-Access-Policy'],
    credentials: true,
    maxAge: 86400, // 24 heures de cache pour les requêtes preflight
  });

  console.log('CORS configuration applied');

  // Définir le préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');
  console.log('Global prefix /api set');

  // Configuration des fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads',
  });

  // Configuration pour servir les fichiers statiques du dossier public
  app.useStaticAssets(join(process.cwd(), 'public'), {
    index: false,
  });

  console.log('Static assets configured');

  app.use('/favicon.ico', (req, res, next) => {
    const faviconPath = join(process.cwd(), 'public', 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      res.status(404).send();
    }
  });

  app.use((req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'credentialless');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');

    // Pour les images spécifiquement
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.header('Cache-Control', 'public, max-age=31536000');
      res.header('Access-Control-Allow-Origin', '*');
    }

    next();
  });

  try {
    await app.listen(3000, '0.0.0.0');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
