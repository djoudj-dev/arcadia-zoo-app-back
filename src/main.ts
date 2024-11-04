import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectPostgres } from './config/postgres.config';
import { connectMongoDB } from './config/mongo.config';
import * as cors from 'cors';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Activer CORS en utilisant l'origine définie dans le .env
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }),
  );

  // Servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads/habitats'), {
    prefix: '/uploads/habitats',
  });

  // Connexion à PostgreSQL & MongoDB
  await connectPostgres();
  await connectMongoDB();

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Serveur en cours d'exécution sur le port ${process.env.PORT ?? 3000}`,
  );
}

bootstrap();
