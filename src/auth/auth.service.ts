import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountService } from '../modules/dashboard/admin-dashboard/account-management/services/account.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('Attempting to validate user:', email);
    const user = await this.accountService.findByEmail(email);
    if (!user) {
      console.log('User not found:', email);
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('User found, checking password...');
    const isPasswordMatch = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatch) {
      console.log('Password does not match');
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('User validated successfully');
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      user: {
        ...user,
        token: accessToken,
        refreshToken,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.accountService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }
}
