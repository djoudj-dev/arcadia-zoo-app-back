import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ImageController } from './controllers/image.controller';
import { AnimalsModule } from './modules/animals-zoo/animals.module';
import { AccountModule } from './modules/dashboard/admin-dashboard/account-management/account.module';
import { AnimalModule } from './modules/dashboard/admin-dashboard/animal-management/animal.module';
import { HabitatModule } from './modules/dashboard/admin-dashboard/habitat-management/habitat.module';
import { OpeningHoursManagementModule } from './modules/dashboard/admin-dashboard/opening-hours-management/opening-hours-management.module';
import { ServiceModule } from './modules/dashboard/admin-dashboard/service-management/service.module';
import { AnimalFeedingManagementModule } from './modules/dashboard/employe-dashboard/animal-feeding-management/animal-feeding-management.module';
import { HabitatCommentModule } from './modules/dashboard/veterinary-dashboard/habitat-comment/habitat-comment.module';
import { VeterinaryReportsModule } from './modules/dashboard/veterinary-dashboard/veterinary-reports/veterinary-reports.module';
import { HabitatsModule } from './modules/habitats-zoo/habitats.module';
import { MailModule } from './modules/mail/mail.module';
import { ServicesModule } from './modules/services-zoo/services.module';
import { CountResourceModule } from './modules/stats-board/counts-resource/count-resource.module';
import { StatsBoardModule } from './modules/stats-board/stats-board.module';
import { VisitStatsModule } from './modules/stats-board/visit-stats/visit-stats.module';
import { UserOpinionsModule } from './modules/user-opinions/user-opinions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected successfully');
          console.log('MongoDB connection URL:', process.env.MONGO_URL);
        });
        connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
          console.error('Attempted connection URL:', process.env.MONGO_URL);
        });
        return connection;
      },
    }),
    AuthModule,
    AccountModule,
    HabitatModule,
    HabitatsModule,
    AnimalModule,
    AnimalsModule,
    ServiceModule,
    ServicesModule,
    CountResourceModule,
    UserOpinionsModule,
    AnimalFeedingManagementModule,
    VeterinaryReportsModule,
    HabitatCommentModule,
    OpeningHoursManagementModule,
    MailModule,
    VisitStatsModule,
    StatsBoardModule,
  ],
  controllers: [AppController, AuthController, ImageController],
  providers: [AppService],
})
export class AppModule {}
