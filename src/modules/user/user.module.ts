import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Exporte UserService pour que AuthModule puisse y accéder
})
export class UserModule {}
