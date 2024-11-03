import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Exporte UserService pour que AuthModule puisse y accéder
})
export class UserModule {}
