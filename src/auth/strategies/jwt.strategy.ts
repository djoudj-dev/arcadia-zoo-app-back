import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from 'src/modules/admin-dashboard/account-management/services/account.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private accountService: AccountService) {
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
    console.log('User Data:', user); // Ajoutez ce log pour vérifier les données de l'utilisateur
    return user;
  }
}
