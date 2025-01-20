import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HabitatComment } from '../models/habitat-comment.model';
import { HabitatCommentService } from '../services/habitat-comment.service';

@Controller('veterinary/habitat-comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HabitatCommentController {
  constructor(private readonly habitatCommentService: HabitatCommentService) {}

  /**
   * Récupère tous les commentaires d'habitat
   */
  @Get()
  async getAllHabitatComments(): Promise<HabitatComment[]> {
    return this.habitatCommentService.getAllHabitatComments();
  }

  /**
   * Récupère les commentaires pour un habitat spécifique
   */
  @Get(':id')
  async getHabitatCommentById(
    @Param('id') id: number,
  ): Promise<HabitatComment[]> {
    return this.habitatCommentService.getHabitatCommentByHabitatId(Number(id));
  }

  /**
   * Crée un nouveau commentaire d'habitat
   */
  @Post()
  @Roles('Veterinaire')
  async createHabitatComment(
    @Body() habitatCommentData: HabitatComment,
    @Request() req,
  ): Promise<HabitatComment> {
    console.log('Données reçues dans le contrôleur:', habitatCommentData);
    console.log('Données utilisateur:', req.user);

    const commentData = {
      ...habitatCommentData,
      id_user: req.user.id,
      user_name: req.user.name,
      habitat_name: `Habitat ${habitatCommentData.id_habitat}`,
      is_resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Données à envoyer au service:', commentData);
    return this.habitatCommentService.createHabitatComment(
      commentData,
      req.user.id,
      req.user.name,
    );
  }

  /**
   * Met à jour un commentaire d'habitat existant
   */
  @Put(':id')
  @Roles('Veterinaire')
  async updateHabitatComment(
    @Param('id') id: number,
    @Body() habitatCommentData: HabitatComment,
  ): Promise<HabitatComment | null> {
    return this.habitatCommentService.updateHabitatComment(
      id.toString(),
      habitatCommentData,
    );
  }

  /**
   * Supprime un commentaire d'habitat
   */
  @Delete(':id')
  @Roles('Veterinaire')
  async deleteHabitatComment(@Param('id') id: number): Promise<void> {
    return this.habitatCommentService.deleteHabitatComment(id.toString());
  }

  /**
   * Marque un commentaire comme réglé
   */
  @Patch(':id/resolve')
  @Roles('admin')
  async resolveComment(
    @Param('id') id: string,
    @Request() req,
  ): Promise<HabitatComment> {
    const commentId = id.toString();
    return this.habitatCommentService.resolveComment(commentId, req.user.sub);
  }

  /**
   * Réouvre un commentaire
   */
  @Patch(':id/reopen')
  @Roles('admin')
  async reopenComment(@Param('id') id: string): Promise<HabitatComment> {
    const commentId = id.toString();
    return this.habitatCommentService.reopenComment(commentId);
  }
}
