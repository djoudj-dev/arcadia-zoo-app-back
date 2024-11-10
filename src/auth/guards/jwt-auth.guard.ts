import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      console.error('Token manquant');
      throw new UnauthorizedException('Token manquant');
    }

    console.log('Token reçu dans JwtAuthGuard:', token);

    // Laissons `super.canActivate` gérer la vérification du token via `JwtStrategy`
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('handleRequest - Erreur:', err);
    console.log('handleRequest - Utilisateur:', user);
    console.log('handleRequest - Info:', info);

    if (err || !user) {
      throw new UnauthorizedException('Accès non autorisé');
    }
    return user;
  }
}
