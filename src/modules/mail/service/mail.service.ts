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
  ) {}

  private async compileTemplate(templateName: string, context: any) {
    const templatePath = join(
      process.cwd(),
      'dist/src/modules/mail/templates',
      `${templateName}.hbs`,
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `Template ${templateName}.hbs non trouvé dans ${templatePath}`,
      );
    }
    const template = await fs.promises.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(context);
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
}
