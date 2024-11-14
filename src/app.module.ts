import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
      envFilePath: `.env`,
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_SECRET || !config.POSTGRESQL_ARCADIA_URL) {
          throw new Error('Configuration manquante!');
        }
        return config;
      },
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
