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
import { HabitatsModule } from './modules/habitats-zoo/habitats.module';
import { ServicesModule } from './modules/services-zoo/services.module';
import { CountResourceModule } from './modules/stats-board/counts-resource/count-resource.module';
import { UserOpinionsModule } from './modules/user-opinions/user-opinions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_SECRET || !config.MONGODB_URI) {
          throw new Error('Configuration manquante!');
        }
        return config;
      },
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
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
