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
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Servir les fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3000);
}

bootstrap();
