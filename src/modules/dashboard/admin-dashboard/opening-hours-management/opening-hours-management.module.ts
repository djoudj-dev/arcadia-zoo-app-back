import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningHoursManagementController } from './controllers/opening-hours-management.controller';
import { OpeningHoursService } from './services/opening-hours.service';
import { OpeningHoursSchema } from './schemas/opening-hours.schema';
import { ParkStatusSchema } from './schemas/park-status.schema';

/**
 * Module de gestion des horaires d'ouverture.
 * Ce module regroupe les composants nécessaires pour les opérations
 * CRUD sur les horaires d'ouverture, incluant le contrôleur et le service associés.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'OpeningHours', schema: OpeningHoursSchema },
      { name: 'ParkStatus', schema: ParkStatusSchema },
    ]),
  ],
  controllers: [OpeningHoursManagementController],
  providers: [OpeningHoursService],
  exports: [OpeningHoursService],
})
export class OpeningHoursManagementModule {}
