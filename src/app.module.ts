import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './modules/user/controllers/user.controller';
import { UserService } from './modules/user/services/user.service';
import { RoleService } from './modules/user/services/role.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module'; // Importez AuthModule

@Module({
  imports: [AuthModule], // Ajoutez AuthModule ici
  controllers: [AppController, UserController, AuthController],
  providers: [AppService, UserService, RoleService, AuthService],
})
export class AppModule {}
