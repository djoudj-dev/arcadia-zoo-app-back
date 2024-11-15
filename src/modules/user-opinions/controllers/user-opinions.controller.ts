import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserOpinions } from '../model/user-opinions.model';
import { UserOpinionsService } from '../services/user-opinions.service';

/**
 * Contrôleur gérant les endpoints pour les avis utilisateurs
 * Route de base : /user-opinions
 */
@Controller('user-opinions')
export class UserOpinionsController {
  /**
   * Constructeur du contrôleur UserOpinions
   * @param userOpinionsService Service injecté pour la gestion des avis utilisateurs
   */
  constructor(private userOpinionsService: UserOpinionsService) {}

  /**
   * Récupère tous les avis validés
   * @route GET /user-opinions/validated
   * @returns Une promesse contenant un tableau des avis validés
   */
  @Get('validated')
  async getValidatedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getValidatedUserOpinions();
  }

  /**
   * Récupère tous les avis sans filtrage
   * @route GET /user-opinions/all
   * @returns Une promesse contenant un tableau de tous les avis
   */
  @Get('all')
  async getAllUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getAllUserOpinions();
  }

  /**
   * Récupère les avis en attente de validation
   * @route GET /user-opinions/pending
   * @returns Une promesse contenant un tableau des avis en attente
   */
  @Get('pending')
  async getPendingUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getPendingUserOpinions();
  }

  /**
   * Crée un nouvel avis utilisateur
   * @route POST /user-opinions
   * @param userOpinion Les données de l'avis à créer
   * @returns Une promesse contenant l'avis créé
   */
  @Post()
  async createUserOpinion(
    @Body() userOpinion: UserOpinions,
  ): Promise<UserOpinions> {
    try {
      const createdOpinion = await this.userOpinionsService.createUserOpinion({
        ...userOpinion,
        created_at: new Date(),
        updated_at: new Date(),
        validated: false,
        accepted: false,
      });
      return createdOpinion;
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  }

  @Put('validate/:id')
  async validateUserOpinion(@Param('id') id: string): Promise<UserOpinions> {
    console.log("[Controller] Validation de l'avis:", id);
    const updatedOpinion = await this.userOpinionsService.updateUserOpinion(
      id,
      {
        validated: true,
      } as UserOpinions,
    );

    if (!updatedOpinion) {
      throw new NotFoundException(
        `Avis utilisateur avec l'id ${id} non trouvé`,
      );
    }
    return updatedOpinion;
  }

  @Put(':id')
  async updateUserOpinion(
    @Param('id') id: string,
    @Body() userOpinion: UserOpinions,
  ): Promise<UserOpinions> {
    const updatedOpinion = await this.userOpinionsService.updateUserOpinion(
      id,
      userOpinion,
    );
    if (!updatedOpinion) {
      throw new NotFoundException(`User opinion with id ${id} not found`);
    }
    return updatedOpinion;
  }

  @Delete(':id')
  async deleteUserOpinion(
    @Param('id') id: string,
  ): Promise<UserOpinions | null> {
    const deletedOpinion = await this.userOpinionsService.deleteUserOpinion(id);
    if (!deletedOpinion) {
      throw new NotFoundException(`User opinion with id ${id} not found`);
    }
    return deletedOpinion;
  }
}
