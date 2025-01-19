import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAILER_TRANSPORT') readonly transport: Transporter,
    @Inject('TEMPLATE_DIR') readonly templateDir: string,
  ) {
    console.log('📧 Dossier des templates:', this.templateDir);
  }

  private async compileTemplate(templateName: string, context: any) {
    const templatePath = join(this.templateDir, `${templateName}.hbs`);
    console.log('📧 Tentative de lecture du template à:', templatePath);

    try {
      // Vérifier si le dossier des templates existe
      if (!fs.existsSync(this.templateDir)) {
        console.error('❌ Dossier des templates non trouvé:', this.templateDir);
        throw new Error(
          `Dossier des templates non trouvé: ${this.templateDir}`,
        );
      }

      // Lister le contenu du dossier pour le debug
      const files = fs.readdirSync(this.templateDir);
      console.log('📁 Templates disponibles:', files);

      // Vérifier si le template spécifique existe
      if (!fs.existsSync(templatePath)) {
        console.error('❌ Template non trouvé:', templatePath);
        throw new Error(`Template ${templateName}.hbs non trouvé`);
      }

      console.log('✅ Template trouvé, lecture...');
      const template = await fs.promises.readFile(templatePath, 'utf-8');
      console.log('✅ Template lu avec succès');

      const compiledTemplate = handlebars.compile(template);
      return compiledTemplate(context);
    } catch (error) {
      console.error('❌ Erreur lors de la compilation du template:', error);
      throw error;
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    const html = await this.compileTemplate(options.template, options.context);
    return this.transport.sendMail({
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  async sendWelcomeEmail(user: any, temporaryPassword: string) {
    return this.sendMail({
      to: user.email,
      subject: 'Bienvenue sur Arcadia Zoo',
      template: 'welcome',
      context: {
        name: user.name,
        email: user.email,
        password: temporaryPassword,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordChangeConfirmation(user: any) {
    return this.sendMail({
      to: user.email,
      subject: 'Confirmation de changement de mot de passe - Arcadia Zoo',
      template: 'password-changed',
      context: { name: user.name },
    });
  }

  async sendContactEmail(contactData: {
    name: string;
    email: string;
    message: string;
  }) {
    return this.sendMail({
      to: process.env.ADMIN_EMAIL ?? process.env.MAIL_USER,
      subject: 'Nouveau message de contact - Arcadia Zoo',
      template: 'contact',
      context: contactData,
    });
  }

  async sendPasswordResetEmail(user: any, resetCode: string): Promise<void> {
    console.log('📧 Envoi du mail de réinitialisation pour:', user.email);
    try {
      await this.sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        template: 'reset-password',
        context: {
          name: user.name,
          resetCode: resetCode,
        },
      });
      console.log('✅ Mail de réinitialisation envoyé avec succès');
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'envoi du mail de réinitialisation:",
        error,
      );
      throw error;
    }
  }
}
