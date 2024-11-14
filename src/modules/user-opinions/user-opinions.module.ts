import { Module } from '@nestjs/common';
import { pool } from '../../config/postgres.config';
import { UserOpinionsController } from './controllers/user-opinions.controller';
import { UserOpinionsService } from './services/user-opinions.service';

@Module({
  controllers: [UserOpinionsController],
  providers: [
    UserOpinionsService,
    UserOpinionsModule,
    {
      provide: 'DatabaseConnection',
      useValue: pool,
    },
  ],
})
export class UserOpinionsModule {}
