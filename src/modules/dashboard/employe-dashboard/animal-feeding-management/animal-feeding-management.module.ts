import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from '../../../dashboard/admin-dashboard/account-management/account.module';
import { AnimalFeedingManagementController } from './controllers/animal-feeding-management.controller';
import { AnimalFeedingManagementSchema } from './schemas/animal-feeding-management.schema';
import { AnimalFeedingManagementService } from './services/animal-feeding-management.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AnimalFeedingManagement',
        schema: AnimalFeedingManagementSchema,
        collection: 'animal_feeding_management',
      },
    ]),
    AccountModule,
  ],
  controllers: [AnimalFeedingManagementController],
  providers: [AnimalFeedingManagementService],
  exports: [AnimalFeedingManagementService],
})
export class AnimalFeedingManagementModule {}
