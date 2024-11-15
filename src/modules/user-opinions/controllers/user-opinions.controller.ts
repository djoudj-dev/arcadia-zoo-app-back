import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserOpinions } from '../model/user-opinions.model';
import { UserOpinionsService } from '../services/user-opinions.service';

@Controller('user-opinions')
export class UserOpinionsController {
  /**
   * Injection du service UserOpinionsService pour la gestion des avis utilisateurs.
   * @param userOpinionsService Service de gestion des avis utilisateurs.
   */
  constructor(private userOpinionsService: UserOpinionsService) {}

  @Get()
  async getAllUserOpinions(
    @Query('validated') validated?: string,
  ): Promise<UserOpinions[]> {
    console.log('[Controller] validated query param:', validated);

    // Si validated n'est pas défini, on considère false par défaut
    const isValidated = validated === undefined ? false : validated === 'true';

    console.log('[Controller] isValidated après conversion:', isValidated);
    console.log('[Controller] Type de isValidated:', typeof isValidated);

    return this.userOpinionsService.getAllUserOpinions(isValidated);
  }

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
