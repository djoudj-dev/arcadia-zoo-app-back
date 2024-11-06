import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './modules/admin-dashboard/account-management/account.module';
import { HabitatModule } from './modules/admin-dashboard/habitat-management/habitat.module';
import { HabitatsModule } from './modules/habitats/habitats.module';
import { AnimalModule } from './modules/admin-dashboard/animal-management/animal.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { ServiceModule } from './modules/admin-dashboard/service-management/service.module';

@Module({
  imports: [
    AuthModule,
    AccountModule,
    HabitatModule,
    HabitatsModule,
    AnimalModule,
    AnimalsModule,
    ServiceModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
