import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserOpinions } from '../model/user-opinions.model';
import { UserOpinionsService } from '../services/user-opinions.service';

/**
 * Contrôleur gérant les endpoints pour les avis utilisateurs
 * Route de base : /user-opinions
 *
 * Organisation des endpoints:
 * - Endpoints de consultation (GET)
 * - Endpoints de création et modification (POST, PUT, PATCH)
 * - Endpoints de modération (validate, reject)
 * - Endpoints de suppression (DELETE)
 */
@Controller('user-opinions')
export class UserOpinionsController {
  constructor(private readonly userOpinionsService: UserOpinionsService) {}

  // ==================== ENDPOINTS DE CONSULTATION ====================

  /**
   * Récupère tous les avis sans filtrage
   * @route GET /user-opinions/all
   * @param sort Paramètre optionnel de tri
   * @returns Liste de tous les avis
   */
  @Get('all')
  async getAllUserOpinions(
    @Query('sort') sort?: string,
  ): Promise<UserOpinions[]> {
    return this.userOpinionsService.getAllUserOpinions(sort);
  }

  /**
   * Récupère uniquement les avis validés
   * @route GET /user-opinions/validated
   * @returns Liste des avis validés
   */
  @Get('validated')
  async getValidatedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getValidatedUserOpinions();
  }

  /**
   * Récupère les avis en attente de modération
   * @route GET /user-opinions/pending
   * @returns Liste des avis en attente
   */
  @Get('pending')
  async getPendingUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getPendingUserOpinions();
  }

  /**
   * Récupère les avis refusés
   * @route GET /user-opinions/rejected
   * @returns Liste des avis refusés
   */
  @Get('rejected')
  async getRejectedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getRejectedUserOpinions();
  }

  // ==================== ENDPOINTS DE CRÉATION ET MODIFICATION ====================

  /**
   * Crée un nouvel avis utilisateur
   * @route POST /user-opinions
   * @param userOpinion Données de l'avis à créer
   * @returns L'avis créé
   */
  @Post()
  async createUserOpinion(
    @Body() userOpinion: UserOpinions,
  ): Promise<UserOpinions> {
    try {
      return await this.userOpinionsService.createUserOpinion({
        ...userOpinion,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  }

  /**
   * Met à jour un avis existant
   * @route PUT /user-opinions/:id
   * @param id Identifiant de l'avis
   * @param userOpinion Nouvelles données
   * @returns L'avis mis à jour
   */
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
      throw new NotFoundException(`Avis avec l'id ${id} non trouvé`);
    }
    return updatedOpinion;
  }

  // ==================== ENDPOINTS DE MODÉRATION ====================

  /**
   * Valide un avis utilisateur
   * @route PATCH /user-opinions/validate/:id
   * @param id Identifiant de l'avis
   * @returns L'avis validé
   */
  @Patch('validate/:id')
  async validateUserOpinions(@Param('id') id: string) {
    try {
      const result = await this.userOpinionsService.validateUserOpinions(id);
      if (!result) {
        throw new NotFoundException(`Avis non trouvé pour l'ID: ${id}`);
      }
      return result;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Avis non trouvé pour l'ID: ${id}`);
      }
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de la validation de l'avis ${id}`,
      );
    }
  }

  /**
   * Refuse un avis utilisateur
   * @route PATCH /user-opinions/reject/:id
   * @param id Identifiant de l'avis
   * @returns L'avis refusé
   */
  @Patch('reject/:id')
  async rejectUserOpinion(@Param('id') id: string) {
    try {
      return await this.userOpinionsService.rejectUserOpinion(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // ==================== ENDPOINTS DE SUPPRESSION ====================

  /**
   * Supprime un avis utilisateur
   * @route DELETE /user-opinions/:id
   * @param id Identifiant de l'avis
   * @returns L'avis supprimé
   */
  @Delete(':id')
  async deleteUserOpinion(
    @Param('id') id: string,
  ): Promise<UserOpinions | null> {
    const deletedOpinion = await this.userOpinionsService.deleteUserOpinion(id);
    if (!deletedOpinion) {
      throw new NotFoundException(`Avis avec l'id ${id} non trouvé`);
    }
    return deletedOpinion;
  }
}
