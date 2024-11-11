import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AccountModule } from './modules/admin-dashboard/account-management/account.module';
import { AnimalModule } from './modules/admin-dashboard/animal-management/animal.module';
import { HabitatModule } from './modules/admin-dashboard/habitat-management/habitat.module';
import { ServiceModule } from './modules/admin-dashboard/service-management/service.module';
import { AnimalsModule } from './modules/animals-zoo/animals.module';
import { HabitatsModule } from './modules/habitats-zoo/habitats.module';
import { ServicesModule } from './modules/services-zoo/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`, // Charge .env.production si NODE_ENV=production
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_SECRET) {
          throw new Error('JWT_SECRET is missing!');
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
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
