import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AnimalsModule } from './modules/animals-zoo/animals.module';
import { AccountModule } from './modules/dashboard/admin-dashboard/account-management/account.module';
import { AnimalModule } from './modules/dashboard/admin-dashboard/animal-management/animal.module';
import { HabitatModule } from './modules/dashboard/admin-dashboard/habitat-management/habitat.module';
import { ServiceModule } from './modules/dashboard/admin-dashboard/service-management/service.module';
import { AnimalFeedingManagementModule } from './modules/dashboard/employe-dashboard/animal-feeding-management/animal-feeding-management.module';
import { VeterinaryReportsModule } from './modules/dashboard/veterinary-dashboard/veterinary-reports/veterinary-reports.module';
import { HabitatsModule } from './modules/habitats-zoo/habitats.module';
import { ServicesModule } from './modules/services-zoo/services.module';
import { CountResourceModule } from './modules/stats-board/counts-resource/count-resource.module';
import { UserOpinionsModule } from './modules/user-opinions/user-opinions.module';
import { HabitatCommentModule } from './modules/dashboard/veterinary-dashboard/habitat-comment/habitat-comment.module';

console.log("Variables d'environnement :", {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connecté avec succès');
          });
          connection.on('error', (error) => {
            console.error('Erreur de connexion MongoDB:', error);
          });
          return connection;
        },
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AccountModule,
    HabitatModule,
    HabitatsModule,
    AnimalModule,
    AnimalsModule,
    ServiceModule,
    ServicesModule,
    CountResourceModule,
    UserOpinionsModule,
    AnimalFeedingManagementModule,
    VeterinaryReportsModule,
    HabitatCommentModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
