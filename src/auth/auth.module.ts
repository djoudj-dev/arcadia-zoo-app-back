import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { AccountModule } from 'src/modules/admin-dashboard/account-management/account.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

dotenv.config();

@Module({
  imports: [
    AccountModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'votre_secret_de_dev',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
