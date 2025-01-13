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
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

    // Ajouter les en-têtes pour le partitionnement des cookies
    res.header('Storage-Access-Policy', 'unpartitioned-storage');
    res.header('Partitioned-Cookie', 'none');

    next();
  });

  // Convertir la chaîne de domaines en tableau
  const corsOrigins = process.env.CORS_ORIGIN?.split(',');

  // Configuration CORS
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
    credentials: true,
    exposedHeaders: ['Storage-Access-Policy'],
  });

  console.log('CORS configuration applied');

  // Définir le préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  // Configuration des fichiers statiques avec le préfixe /api
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads', // On remet le préfixe /api
  });

  await app.listen(3000, '0.0.0.0');
  console.log('NestJS server is running on http://localhost:3000');
}

bootstrap();
