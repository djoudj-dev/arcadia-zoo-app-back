import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { MailController } from './controller/mail.controller';
import { MailService } from './service/mail.service';

dotenv.config();

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
      template: {
        dir: join(__dirname, 'template'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {
  constructor() {
    console.log('Template directory:', join(__dirname, 'template'));
    console.log('Configuration email:', {
      host: process.env.MAIL_HOST,
      user: process.env.MAIL_USER ? '✓' : '✗',
      pass: process.env.MAIL_PASSWORD ? '✓' : '✗',
      from: process.env.MAIL_FROM,
      adminEmail: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
    });
  }
}
