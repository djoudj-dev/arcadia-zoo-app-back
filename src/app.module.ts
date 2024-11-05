import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './modules/admin-dashboard/account-management/account.module';
import { HabitatModule } from './modules/admin-dashboard/habitat-management/habitat.module';
import { HabitatsModule } from './modules/habitats/habitats.module';

@Module({
  imports: [AuthModule, AccountModule, HabitatModule, HabitatsModule],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
