import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';

@Module({
  imports: [],
  controllers: [AccountController], // Déclare les contrôleurs
  providers: [AccountService], // Déclare les services
  exports: [AccountService], // Exporte les services pour une utilisation dans d'autres modules
})
export class AccountModule {}
