import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from 'src/modules/dashboard/admin-dashboard/account-management/services/account.service';
import { AnimalFeedingManagement } from '../models/animal-feeding-management.model';

@Injectable()
export class AnimalFeedingManagementService {
  constructor(
    @InjectModel('AnimalFeedingManagement')
    private readonly animalFeedingModel: Model<AnimalFeedingManagement>,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Récupère tous les repas des animaux
   */
  async getAllAnimalFeeding(): Promise<AnimalFeedingManagement[]> {
    return await this.animalFeedingModel.find().exec();
  }

  /**
   * Récupère l'historique des repas d'un animal par son ID
   * @param animalId ID de l'animal
   * @returns Une promesse d'un tableau d'objets AnimalFeedingManagement
   */
  async getAnimalFeedingHistory(
    animalId: number,
  ): Promise<AnimalFeedingManagement[]> {
    return await this.animalFeedingModel
      .find({ animal_id: animalId })
      .sort({ feeding_date: -1 })
      .exec();
  }

  /**
   * Récupère un repas d'animal par son ID
   */
  async getAnimalFeedingById(
    id: number,
  ): Promise<AnimalFeedingManagement | null> {
    return await this.animalFeedingModel.findById(id).exec();
  }

  /**
   * Récupère les repas d'animaux par ID d'employé
   */
  async getAnimalFeedingByEmployeId(
    employeId: number,
  ): Promise<AnimalFeedingManagement[]> {
    return await this.animalFeedingModel.find({ employeId: employeId }).exec();
  }

  /**
   * Crée un nouveau repas d'animal
   */
  async createAnimalFeeding(
    animalFeedingData: AnimalFeedingManagement,
    userId: number,
  ): Promise<AnimalFeedingManagement> {
    // Vérifier si l'utilisateur existe et récupérer ses informations
    const user = await this.accountService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Créer l'enregistrement avec l'ID utilisateur et son nom
    const newAnimalFeeding = new this.animalFeedingModel({
      ...animalFeedingData,
      user_id: userId,
      user_name: user.name,
    });
    return await newAnimalFeeding.save();
  }

  /**
   * Met à jour un repas d'animal
   */
  async updateAnimalFeeding(
    animalFeedingData: AnimalFeedingManagement,
  ): Promise<AnimalFeedingManagement | null> {
    return await this.animalFeedingModel
      .findByIdAndUpdate(animalFeedingData.id_feeding, animalFeedingData, {
        new: true,
      })
      .exec();
  }

  /**
   * Supprime un repas d'animal
   */
  async deleteAnimalFeeding(
    id: number,
  ): Promise<AnimalFeedingManagement | null> {
    return await this.animalFeedingModel.findByIdAndDelete(id).exec();
  }

  async getAnimalFeedingByUserId(
    userId: number,
  ): Promise<AnimalFeedingManagement[]> {
    return await this.animalFeedingModel.find({ user_id: userId }).exec();
  }
}
