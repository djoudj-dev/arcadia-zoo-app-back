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

@Controller('habitat-comment')
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
  async createHabitatComment(
    @Body() habitatCommentData: HabitatComment,
    @Request() req,
  ): Promise<HabitatComment> {
    return this.habitatCommentService.createHabitatComment(
      habitatCommentData,
      req.user.id,
    );
  }

  /**
   * Met à jour un commentaire d'habitat existant
   */
  @Put(':id')
  async updateHabitatComment(
    @Param('id') id: number,
    @Body() habitatCommentData: HabitatComment,
  ): Promise<HabitatComment | null> {
    return this.habitatCommentService.updateHabitatComment(
      id,
      habitatCommentData,
    );
  }

  /**
   * Supprime un commentaire d'habitat
   */
  @Delete(':id')
  async deleteHabitatComment(
    @Param('id') id: number,
  ): Promise<HabitatComment | null> {
    return this.habitatCommentService.deleteHabitatComment(id);
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
    return this.habitatCommentService.resolveComment(commentId, req.user.id);
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
