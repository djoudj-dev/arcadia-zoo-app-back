import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as session from 'express-session';
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
  console.log('Starting application...');

  if (!process.env.SESSION_SECRET) {
    console.error(
      'ERROR: SESSION_SECRET must be defined in environment variables',
    );
    process.exit(1);
  }

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
        "script-src 'self' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com https://maps.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://nedellec-julien.fr https://nedellec-julien.fr/assets/fontawesome/css/; " +
        "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://api.nedellec-julien.fr https://nedellec-julien.fr; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://nedellec-julien.fr/assets/fontawesome/webfonts/ data:; " +
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
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'https://nedellec-julien.fr',
  ];
  console.log('CORS Origins:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'Partitioned-Cookie',
      'Storage-Access-Policy',
      'Origin',
      'Accept',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
    ],
    credentials: true,
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
  });

  console.log('CORS configuration applied');

  // Définir le préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');
  console.log('Global prefix /api set');

  // Configuration des fichiers statiques avec options étendues
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Chemin des uploads:', uploadsPath);
  console.log('Contenu du dossier uploads:', fs.readdirSync(uploadsPath));

  app.useStaticAssets(uploadsPath, {
    prefix: '/api/uploads',
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', corsOrigins[0]);
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Cross-Origin-Opener-Policy', 'same-origin');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Headers', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });

  // Middleware de gestion d'erreurs pour les fichiers statiques
  app.use('/api/uploads', (err, req, res, next) => {
    console.error('Erreur accès fichier:', {
      url: req.url,
      error: err.message,
      code: err.code,
      path: join(uploadsPath, req.url),
      exists: fs.existsSync(join(uploadsPath, req.url)),
    });

    if (err.code === 'ENOENT') {
      return res.status(404).json({
        message: 'Fichier non trouvé',
        path: req.url,
        error: err.message,
      });
    }
    next(err);
  });

  // Ajouter après la configuration CORS
  app.use((req, res, next) => {
    // Générer un nonce aléatoire pour chaque requête
    const nonce = crypto.randomBytes(16).toString('base64');

    // Configurer Content-Security-Policy
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://maps.googleapis.com;
      frame-src 'self' https://www.google.com;
      img-src 'self' data: https: blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://maps.googleapis.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;`,
    );

    // Autres en-têtes de sécurité recommandés
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=()');

    next();
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      cookie: {
        secure: true,
        sameSite: 'strict',
        partitioned: true, // Pour supporter le partitionnement des cookies
      },
    }),
  );

  try {
    await app.listen(3000, '0.0.0.0');
    console.log('Server successfully started on port 3000');
    console.log('Environment variables:');
    console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
