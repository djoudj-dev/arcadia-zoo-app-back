import { Module } from '@nestjs/common';
import { RoleController } from 'src/modules/user/controllers/role.controller';
import { UserController } from 'src/modules/user/controllers/user.controller';
import { RoleService } from 'src/modules/user/services/role.service';
import { UserService } from 'src/modules/user/services/user.service';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';

@Module({
  imports: [],
  controllers: [UserController, RoleController, AccountController], // Déclare les contrôleurs
  providers: [UserService, RoleService, AccountService], // Déclare les services
  exports: [UserService, RoleService, AccountService], // Exporte les services pour une utilisation dans d'autres modules
})
export class AccountModule {}
