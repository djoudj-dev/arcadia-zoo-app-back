// src/auth/auth.service.ts

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
    const user = await this.accountService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordMatch = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      user: {
        ...user,
        token,
      },
    };
  }
}
