import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Défini dans le .env
      signOptions: { expiresIn: '1h' }, // Durée de validité du token
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Exportez JwtModule pour qu'il soit disponible dans d'autres modules
})
export class AuthModule {}
