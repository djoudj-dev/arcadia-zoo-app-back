import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserOpinionsController } from './controllers/user-opinions.controller';
import { UserOpinionsSchema } from './schemas/user-opinions.schema';
import { UserOpinionsService } from './services/user-opinions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'UserOpinions',
        schema: UserOpinionsSchema,
        collection: 'user_opinions',
      },
    ]),
  ],
  controllers: [UserOpinionsController],
  providers: [UserOpinionsService],
  exports: [UserOpinionsService],
})
export class UserOpinionsModule {}
