import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from 'src/modules/admin-dashboard/account-management/services/account.service';

// Charger les variables d'environnement
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private accountService: AccountService) {
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Ajout d'un log ici pour vérifier la clé
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.accountService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
