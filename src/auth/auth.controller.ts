import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() req: { email: string; password: string }) {
    const user = await this.authService.validateUser(req.email, req.password);
    return this.authService.login(user);
  }

  @Post('token/refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    console.log('Tentative de rafraîchissement du token');
    try {
      const result = await this.authService.refreshTokens(body.refreshToken);
      console.log('Token rafraîchi avec succès');
      return result;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
}
