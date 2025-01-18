import { Body, Controller, Post } from '@nestjs/common';
import { PasswordResetService } from '../service/password-reset.service';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('initiate')
  async initiateReset(@Body() body: { email: string }) {
    await this.passwordResetService.initiatePasswordReset(body.email);
    return {
      message:
        'Si votre email existe, vous recevrez un code de réinitialisation.',
    };
  }

  @Post('verify')
  async verifyCode(@Body() body: { email: string; code: string }) {
    const isValid = await this.passwordResetService.verifyResetCode(
      body.email,
      body.code,
    );
    return { isValid };
  }

  @Post('reset')
  async resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    await this.passwordResetService.resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
