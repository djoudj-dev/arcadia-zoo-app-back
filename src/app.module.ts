import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './modules/admin-dashboard/account-management/account.module';
import { AnimalModule } from './modules/admin-dashboard/animal-management/animal.module';
import { HabitatModule } from './modules/admin-dashboard/habitat-management/habitat.module';
import { ServiceModule } from './modules/admin-dashboard/service-management/service.module';
import { AnimalsModule } from './modules/animals-zoo/animals.module';
import { HabitatsModule } from './modules/habitats-zoo/habitats.module';
import { ServicesModule } from './modules/services-zoo/services.module';
import { CountResourceModule } from './modules/stats-board/counts-resource/count-resource.module';
import { UserOpinionsModule } from './modules/user-opinions/user-opinions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => {
        const requiredEnvVars = [
          'JWT_SECRET',
          'MONGODB_URI',
          'POSTGRESQL_ARCADIA_URL',
        ];
        const missingVars = requiredEnvVars.filter((envVar) => !config[envVar]);

        if (missingVars.length > 0) {
          throw new Error(
            `Configuration manquante! ${missingVars.join(', ')} sont requis`,
          );
        }
        return config;
      },
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        autoCreate: true,
        autoIndex: true,
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
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
