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
const templateDir = join(process.cwd(), 'src/modules/mail/templates');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
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
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "frame-src 'self' https://www.google.com/; " +
        "connect-src 'self' https://*.googleapis.com",
    );
    next();
  });

  // Configuration CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://nedellec-julien.fr',
      'https://api.nedellec-julien.fr',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
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
