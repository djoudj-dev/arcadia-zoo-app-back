import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HabitatService } from '../services/habitat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Habitat } from '../models/habitat.model';
import { multerOptionsHabitats } from 'src/config/multer.config';

/**
 * Contrôleur pour la gestion des habitats en tant qu'admin.
 * Protégé par les gardes d'authentification et de rôles.
 */
@Controller('admin/habitat-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HabitatController {
  /**
   * Injection du service HabitatService pour accéder aux opérations de gestion d'habitat.
   * @param habitatService Service pour les opérations CRUD des habitats
   */
  constructor(private readonly habitatService: HabitatService) {}

  /**
   * Récupère tous les habitats existants.
   * @returns Une promesse d'un tableau d'objets Habitat
   */
  @Get()
  async getAllHabitats(): Promise<Habitat[]> {
    return this.habitatService.getAllHabitats();
  }

  /**
   * Crée un nouvel habitat avec image.
   * Utilise le rôle "admin" pour limiter l'accès à cette opération.
   * Intercepte l'upload de fichier pour sauvegarder l'image de l'habitat.
   * @param habitatData Données de l'habitat partiellement remplies
   * @param images Fichier d'image téléchargé pour l'habitat
   * @returns La promesse de l'objet Habitat créé
   * @throws BadRequestException Si le fichier image est manquant
   */
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptionsHabitats))
  async createHabitat(
    @Body() habitatData: Partial<Habitat>,
    @UploadedFile() images: Express.Multer.File,
  ): Promise<Habitat> {
    if (images) {
      habitatData.images = `uploads/habitats/${images.filename}`;
    } else {
      console.error('Le champ "images" est requis.');
      throw new BadRequestException('Le champ "images" est requis.');
    }
    return this.habitatService.createHabitat(habitatData, 'admin');
  }

  /**
   * Met à jour les informations d'un habitat existant.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'habitat à mettre à jour
   * @param habitatData Nouvelles données de l'habitat partiellement remplies
   * @returns La promesse de l'objet Habitat mis à jour
   */
  @Roles('admin')
  @Put(':id')
  async updateHabitat(
    @Param('id') id: number,
    @Body() habitatData: Partial<Habitat>,
  ): Promise<Habitat> {
    return this.habitatService.updateHabitat(id, habitatData, 'admin');
  }

  /**
   * Supprime un habitat spécifique.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'habitat à supprimer
   * @returns Un message de confirmation de suppression
   */
  @Roles('admin')
  @Delete(':id')
  async deleteHabitat(@Param('id') id: number): Promise<{ message: string }> {
    return this.habitatService.deleteHabitat(id, 'admin');
  }
}
