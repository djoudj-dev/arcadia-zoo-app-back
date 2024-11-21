import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/dashboard/admin-dashboard/account-management/models/user.model';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordChangeConfirmation(user: User) {
    try {
      const result = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Confirmation de changement de mot de passe - Arcadia Zoo',
        template: './password-changed',
        context: {
          name: user.name,
        },
      });

      console.log('Email de confirmation envoyé à:', user.email);
      return result;
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'email de confirmation:",
        error,
      );
      throw error;
    }
  }

  async sendContactEmail(contactData: {
    name: string;
    email: string;
    message: string;
  }) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      const fromEmail = process.env.MAIL_FROM || 'noreply@arcadia-zoo.fr';

      console.log('Données de contact:', contactData);
      console.log('Configuration email:', {
        from: fromEmail,
        to: adminEmail,
        template: './contact',
        context: contactData,
      });

      const result = await this.mailerService.sendMail({
        from: `"Arcadia Zoo" <${fromEmail}>`,
        to: adminEmail,
        subject: 'Nouveau message de contact - Arcadia Zoo',
        template: './contact',
        context: contactData,
      });

      console.log('Résultat envoi email:', result);
      return result;
    } catch (error) {
      console.error('Erreur complète:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(
    user: { name: string; email: string },
    temporaryPassword: string,
  ) {
    try {
      const result = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Bienvenue sur Arcadia Zoo - Vos identifiants de connexion',
        template: './welcome',
        context: {
          name: user.name,
          email: user.email,
          temporaryPassword: temporaryPassword,
        },
      });

      console.log('Email de bienvenue envoyé à:', user.email);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
      throw error;
    }
  }
}
