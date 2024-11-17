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
  async getAllUserOpinions(
    @Query('sort') sort?: string,
  ): Promise<UserOpinions[]> {
    return this.userOpinionsService.getAllUserOpinions(sort);
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

  /**
   * Valide un avis utilisateur spécifique
   * @route PATCH /user-opinions/:id/validate
   * @param id Identifiant de l'avis à valider
   * @throws NotFoundException si l'avis n'est pas trouvé
   * @returns Une promesse contenant l'avis validé
   */
  @Patch(':id/validate')
  async validateUserOpinions(@Param('id') id: string) {
    console.log('⭐ Début de validateUserOpinions dans le contrôleur');
    console.log('ID reçu:', id);

    try {
      const result = await this.userOpinionsService.validateUserOpinions(id);
      console.log('✅ Validation réussie:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur dans le contrôleur:', error);

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
   * Supprime un avis utilisateur
   * @route DELETE /user-opinions/:id
   * @param id Identifiant de l'avis à supprimer
   * @throws NotFoundException si l'avis n'est pas trouvé
   * @returns Une promesse contenant l'avis supprimé
   */
  // @Put('validate/:id')
  // async validateUserOpinion(@Param('id') id: string): Promise<UserOpinions> {
  //   console.log("[Controller] Validation de l'avis:", id);
  //   const updatedOpinion = await this.userOpinionsService.updateUserOpinion(
  //     id,
  //     {
  //       validated: true,
  //     } as UserOpinions,
  //   );

  //   if (!updatedOpinion) {
  //     throw new NotFoundException(
  //       `Avis utilisateur avec l'id ${id} non trouvé`,
  //     );
  //   }
  //   return updatedOpinion;
  // }

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

  /**
   * Refuse un avis utilisateur spécifique
   * @route PATCH /user-opinions/:id/reject
   * @param id Identifiant de l'avis à refuser
   * @throws NotFoundException si l'avis n'est pas trouvé
   * @returns Une promesse contenant l'avis refusé
   */
  @Patch(':id/reject')
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

  /**
   * Récupère tous les avis refusés
   * @route GET /user-opinions/rejected
   * @returns Une promesse contenant un tableau des avis refusés
   */
  @Get('rejected')
  async getRejectedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsService.getRejectedUserOpinions();
  }
}
