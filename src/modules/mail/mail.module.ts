import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createTransport } from 'nodemailer';
import { join } from 'path';
import { MailController } from './controller/mail.controller';
import { MailService } from './service/mail.service';

dotenv.config();

@Module({
  providers: [
    {
      provide: 'MAILER_TRANSPORT',
      useFactory: () => {
        return createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        });
      },
    },
    {
      provide: 'TEMPLATE_DIR',
      useFactory: () => {
        const baseDir =
          process.env.NODE_ENV === 'production' ? 'dist/src' : 'src';
        const templatePath = join(
          process.cwd(),
          baseDir,
          'modules/mail/templates',
        );
        console.log('📧 Dossier des templates configuré:', templatePath);
        return templatePath;
      },
    },
    MailService,
  ],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
