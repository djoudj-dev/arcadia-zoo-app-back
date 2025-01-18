import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from 'src/modules/dashboard/admin-dashboard/account-management/services/account.service';
import { MailService } from './mail.service';

@Injectable()
export class PasswordResetService {
  private readonly resetCodes: Map<
    string,
    { code: string; timestamp: number }
  > = new Map();

  constructor(
    private readonly accountService: AccountService,
    private readonly mailService: MailService,
  ) {}

  private generateResetCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.accountService.findByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe
      return;
    }

    const resetCode = this.generateResetCode();
    this.resetCodes.set(email, {
      code: resetCode,
      timestamp: Date.now(),
    });

    await this.mailService.sendPasswordResetEmail(user, resetCode);
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const resetData = this.resetCodes.get(email);
    if (!resetData) {
      throw new NotFoundException('Code de réinitialisation non trouvé');
    }

    // Vérifier si le code n'a pas expiré (15 minutes)
    if (Date.now() - resetData.timestamp > 15 * 60 * 1000) {
      this.resetCodes.delete(email);
      throw new UnauthorizedException('Code de réinitialisation expiré');
    }

    if (resetData.code !== code) {
      throw new UnauthorizedException('Code de réinitialisation invalide');
    }

    return true;
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await this.verifyResetCode(email, code);

    const user = await this.accountService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Utiliser la méthode existante pour mettre à jour le mot de passe
    await this.accountService.updatePassword(user.id, null, newPassword);

    // Supprimer le code de réinitialisation
    this.resetCodes.delete(email);
  }
}
