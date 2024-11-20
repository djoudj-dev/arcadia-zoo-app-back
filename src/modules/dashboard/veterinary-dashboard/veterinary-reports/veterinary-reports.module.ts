import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from '../../admin-dashboard/account-management/account.module';
import { AnimalModule } from '../../admin-dashboard/animal-management/animal.module';
import { VeterinaryReportsController } from './controllers/veterinary-reports.controller';
import { VeterinaryReportsSchema } from './schemas/veterinary-reports.schema';
import { VeterinaryReportsService } from './services/veterinary-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'VeterinaryReports',
        schema: VeterinaryReportsSchema,
        collection: 'veterinary_reports',
      },
    ]),
    AccountModule,
    AnimalModule,
  ],
  controllers: [VeterinaryReportsController],
  providers: [VeterinaryReportsService],
  exports: [VeterinaryReportsService],
})
export class VeterinaryReportsModule {}
