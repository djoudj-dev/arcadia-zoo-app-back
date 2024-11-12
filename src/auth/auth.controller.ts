import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req: { email: string; password: string }) {
    const user = await this.authService.validateUser(req.email, req.password);
    return this.authService.login(user);
  }
}
