import { Module, forwardRef } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createTransport } from 'nodemailer';
import { join } from 'path';
import { AccountModule } from '../dashboard/admin-dashboard/account-management/account.module';
import { MailController } from './controller/mail.controller';
import { PasswordResetController } from './controller/password-reset.controller';
import { MailService } from './service/mail.service';
import { PasswordResetService } from './service/password-reset.service';

dotenv.config();

@Module({
  imports: [forwardRef(() => AccountModule)],
  providers: [
    {
      provide: 'MAILER_TRANSPORT',
      useFactory: () => {
        return createTransport({
          host: process.env.MAIL_HOST,
          port: 465,
          secure: true,
          auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.MAIL_PASSWORD,
          },
          from: process.env.MAIL_FROM,
        });
      },
    },
    {
      provide: 'TEMPLATE_DIR',
      useFactory: () => {
        const templatePath = join(process.cwd(), 'dist/modules/mail/templates');
        console.log('📧 Dossier des templates configuré:', templatePath);
        return templatePath;
      },
    },
    MailService,
    PasswordResetService,
  ],
  controllers: [MailController, PasswordResetController],
  exports: [MailService, PasswordResetService],
})
export class MailModule {}
