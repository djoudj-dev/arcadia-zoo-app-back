import { Module } from '@nestjs/common';
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
