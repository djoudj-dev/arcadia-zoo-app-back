import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { HabitatCommentController } from './controllers/habitat-comment.controller';
import { HabitatCommentSchema } from './schemas/habitat-comment.schema';
import { HabitatCommentService } from './services/habitat-comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'HabitatComment',
        schema: HabitatCommentSchema,
        collection: 'habitat_comments',
      },
    ]),
    AuthModule,
  ],
  controllers: [HabitatCommentController],
  providers: [HabitatCommentService],
  exports: [HabitatCommentService],
})
export class HabitatCommentModule {}
