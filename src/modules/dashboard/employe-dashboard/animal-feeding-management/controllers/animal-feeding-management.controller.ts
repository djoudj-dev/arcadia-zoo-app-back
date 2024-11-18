import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AnimalFeedingManagement } from '../models/animal-feeding-management.model';
import { AnimalFeedingManagementService } from '../services/animal-feeding-management.service';

@Controller('employe/animal-feeding-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnimalFeedingManagementController {
  /**
   * Injection du service AnimalFeedingManagementService pour accéder aux opérations de gestion des repas des animaux.
   * @param animalFeedingManagementService Service pour les opérations CRUD des repas des animaux
   */
  constructor(
    private readonly animalFeedingManagementService: AnimalFeedingManagementService,
  ) {}

  /**
   * Récupère tous les repas des animaux existants.
   * @returns Une promesse d'un tableau d'objets AnimalFeedingManagement
   */
  @Get()
  async getAllAnimalFeeding(): Promise<AnimalFeedingManagement[]> {
    return this.animalFeedingManagementService.getAllAnimalFeeding();
  }

  /**
   * Récupère l'historique des repas d'un animal par son identifiant.
   * @param animalId Identifiant de l'animal
   * @returns Une promesse d'un tableau d'objets AnimalFeedingManagement
   */
  @Get('history/:id')
  @Roles('employe', 'veterinaire')
  async getAnimalFeedingHistory(
    @Param('id') animalId: number,
  ): Promise<AnimalFeedingManagement[]> {
    return this.animalFeedingManagementService.getAnimalFeedingHistory(
      animalId,
    );
  }

  /**
   * Récupère un repas d'animal par son identifiant.
   * @param id Identifiant du repas d'animal à récupérer
   * @returns Une promesse d'un objet AnimalFeedingManagement
   */
  @Get(':id')
  @Roles('employe', 'veterinaire')
  async getAnimalFeedingById(
    id: number,
  ): Promise<AnimalFeedingManagement | null> {
    return this.animalFeedingManagementService.getAnimalFeedingById(id);
  }

  /**
   * Récupère les repas d'animal d'un employé par son identifiant.
   * @param id Identifiant de l'employé
   * @returns Une promesse d'un tableau d'objets AnimalFeedingManagement
   */
  @Get('employe/:id')
  @Roles('employe', 'veterinaire')
  async getAnimalFeedingByEmployeId(
    id: number,
  ): Promise<AnimalFeedingManagement[]> {
    return this.animalFeedingManagementService.getAnimalFeedingByEmployeId(id);
  }

  /**
   * Création d'un repas d'animal.
   * @param animalFeedingData Données du repas d'animal à créer
   * @returns Une promesse de l'objet AnimalFeedingManagement créé
   */
  @Post()
  @Roles('employe')
  async createAnimalFeeding(
    @Body() animalFeedingData: AnimalFeedingManagement,
    @Request() req,
  ): Promise<AnimalFeedingManagement> {
    return this.animalFeedingManagementService.createAnimalFeeding(
      animalFeedingData,
      req.user.id,
    );
  }

  /**
   * Mise à jour d'un repas d'animal.
   * @param id Identifiant du repas d'animal à mettre à jour
   * @param animalFeedingData Données du repas d'animal à mettre à jour
   * @returns Une promesse de l'objet AnimalFeedingManagement mis à jour
   */
  @Post(':id')
  @Roles('employe')
  async updateAnimalFeeding(
    @Body() animalFeedingData: AnimalFeedingManagement,
  ): Promise<AnimalFeedingManagement | null> {
    return this.animalFeedingManagementService.updateAnimalFeeding(
      animalFeedingData,
    );
  }

  /**
   * Suppression d'un repas d'animal.
   * @param id Identifiant du repas d'animal à supprimer
   * @returns Une promesse de l'objet AnimalFeedingManagement supprimé
   */
  @Post('delete/:id')
  @Roles('employe')
  async deleteAnimalFeeding(
    id: number,
  ): Promise<AnimalFeedingManagement | null> {
    return this.animalFeedingManagementService.deleteAnimalFeeding(id);
  }

  @Post('feed/:id')
  @Roles('employe')
  async feedAnimal(
    @Param('id') animalId: number,
    @Body()
    feedingData: {
      id: number;
      employeId: number;
      animalId: number;
      userId: number;
      userName: string;
      foodType: string;
      quantity: number;
      feedingTime: Date;
      notes?: string;
    },
    @Request() req: { user: { id: number } },
  ): Promise<AnimalFeedingManagement> {
    const completeFeeding: AnimalFeedingManagement = {
      id_feeding: feedingData.id,
      animal_id: feedingData.animalId,
      feeding_date: feedingData.feedingTime,
      food_type: feedingData.foodType,
      quantity: feedingData.quantity,
      unit: 'kg',
      user_id: feedingData.userId,
      user_name: feedingData.userName,
      employe_id: feedingData.employeId,
      status: 'completed' as const,
      notes: feedingData.notes || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.animalFeedingManagementService.createAnimalFeeding(
      completeFeeding,
      req.user.id,
    );
  }

  @Get('my-feedings')
  @Roles('employe', 'veterinaire')
  async getMyFeedings(@Request() req): Promise<AnimalFeedingManagement[]> {
    return this.animalFeedingManagementService.getAnimalFeedingByUserId(
      req.user.id,
    );
  }
}
