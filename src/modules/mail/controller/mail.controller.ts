import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from '../service/mail.service';

@Controller('contact')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendContactEmail(
    @Body() contactData: { name: string; email: string; message: string },
  ) {
    try {
      console.log('Données reçues:', contactData);
      await this.mailService.sendContactEmail(contactData);
      return {
        success: true,
        message: 'Votre message a été envoyé avec succès',
      };
    } catch (error) {
      console.error('Erreur détaillée:', error);
      return {
        success: false,
        message: `Une erreur s'est produite: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`,
      };
    }
  }
}
