import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectPostgres } from './config/postgres.config';
import { connectMongoDB } from './config/mongo.config';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS en utilisant l'origine définie dans le .env
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }),
  );

  // Connexion à PostgreSQL & MongoDB
  await connectPostgres();
  await connectMongoDB();

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Serveur en cours d'exécution sur le port ${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
