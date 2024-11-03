import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectPostgres } from './config/postgres.config'; // Importez la fonction de connexion
import { connectMongoDB } from './config/mongo.config'; // Importez la fonction de connexion

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Connexion à PostgreSQL
  await connectPostgres(); // Appelez cette fonction pour établir la connexion

  // Connexion à MongoDB
  await connectMongoDB(); // Appelez cette fonction pour établir la connexion

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Serveur en cours d'exécution sur le port ${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
