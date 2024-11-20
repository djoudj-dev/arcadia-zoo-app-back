import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { OpeningHours, ParkStatus } from '../models/opening-hours.model';

@Injectable()
export class OpeningHoursService {
  constructor(
    @InjectModel('OpeningHours') private openingHoursModel: Model<OpeningHours>,
    @InjectModel('ParkStatus') private parkStatusModel: Model<ParkStatus>,
  ) {}

  async getAllOpeningHours(): Promise<OpeningHours[]> {
    return this.openingHoursModel.find().exec();
  }

  async getOpeningHoursById(id: string): Promise<OpeningHours> {
    let openingHours;

    if (id === 'current') {
      openingHours = await this.openingHoursModel
        .findOne({ isCurrent: true })
        .exec();

      if (!openingHours) {
        // Si aucun horaire actuel n'est défini, prendre le plus récent
        openingHours = await this.openingHoursModel
          .findOne()
          .sort({ createdAt: -1 })
          .exec();
      }
    } else {
      openingHours = await this.openingHoursModel.findById(id).exec();
    }

    if (!openingHours) {
      throw new NotFoundException("Horaires d'ouverture non trouvés");
    }

    return openingHours;
  }

  async createOpeningHours(
    openingHoursData: Partial<OpeningHours>,
  ): Promise<OpeningHours> {
    try {
      if (openingHoursData.isCurrent) {
        await this.openingHoursModel.updateMany(
          {},
          { $set: { isCurrent: false } },
        );
      }

      const newOpeningHours = new this.openingHoursModel({
        ...openingHoursData,
        isCurrent: openingHoursData.isCurrent ?? false,
        _id: new mongoose.Types.ObjectId(),
      });

      return await newOpeningHours.save();
    } catch (error) {
      throw new InternalServerErrorException(
        "Erreur lors de la création des horaires d'ouverture",
      );
    }
  }

  async updateOpeningHours(
    id: string,
    data: OpeningHours,
  ): Promise<OpeningHours> {
    try {
      console.log('ID reçu:', id);
      console.log('Données reçues dans le service:', data);

      const existingHours = await this.openingHoursModel.findById(id);
      if (!existingHours) {
        throw new NotFoundException(
          `Horaires d'ouverture avec l'ID ${id} non trouvés`,
        );
      }

      const updatedData = {
        openingHours: data.openingHours,
        parkStatus: data.parkStatus,
        statusMessage: data.statusMessage,
        updatedAt: new Date(),
      };

      console.log('Données à mettre à jour:', updatedData);

      const updatedHours = await this.openingHoursModel
        .findByIdAndUpdate(
          id,
          { $set: updatedData },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedHours) {
        throw new NotFoundException(
          `Impossible de mettre à jour les horaires avec l'ID ${id}`,
        );
      }

      console.log('Horaires mis à jour:', updatedHours);
      return updatedHours;
    } catch (error) {
      console.error('Erreur détaillée:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error && (error as any).name === 'ValidationError') {
        throw new BadRequestException(
          `Erreur de validation: ${(error as any).message}`,
        );
      }

      if (error instanceof Error && (error as any).name === 'CastError') {
        throw new BadRequestException(`ID invalide: ${id}`);
      }

      throw new BadRequestException(
        "Erreur lors de la mise à jour des horaires d'ouverture",
      );
    }
  }

  async deleteOpeningHours(id: string): Promise<void> {
    const result = await this.openingHoursModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Horaires d'ouverture avec l'ID ${id} non trouvés`,
      );
    }
  }

  async updateParkStatus(status: ParkStatus): Promise<ParkStatus> {
    try {
      const parkStatus = await this.parkStatusModel
        .findOneAndUpdate(
          {},
          {
            isOpen: status.isOpen,
            message: status.message,
            _id: 'park-status',
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .lean()
        .exec();

      if (!parkStatus) {
        throw new NotFoundException('Statut du parc non trouvé');
      }

      return {
        isOpen: parkStatus.isOpen,
        message: parkStatus.message,
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du statut du parc',
      );
    }
  }

  /**
   * Récupère les horaires d'ouverture actuels
   * @returns Une promesse de l'objet OpeningHours actuel
   */
  async getCurrentOpeningHours(): Promise<OpeningHours> {
    // Récupère les horaires les plus récents
    const currentHours = await this.openingHoursModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    if (!currentHours) {
      throw new NotFoundException("Aucun horaire d'ouverture n'a été trouvé");
    }

    return currentHours;
  }
}
