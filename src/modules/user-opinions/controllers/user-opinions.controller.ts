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
  HttpStatus,
  HttpCode,
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
    @Query('validated') validated: boolean,
  ): Promise<UserOpinions[]> {
    return this.userOpinionsService.getAllUserOpinions(validated);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
