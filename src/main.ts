import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

// Création du dossier uploads principal
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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'https://nedellec-julien.fr'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Servir les fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads',
  });

  // Définir un préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
