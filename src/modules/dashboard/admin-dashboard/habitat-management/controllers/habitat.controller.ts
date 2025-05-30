import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { multerOptionsHabitats } from '../../../../../config/multer.config';
import { Habitat } from '../models/habitat.model';
import { HabitatService } from '../services/habitat.service';

/**
 * Contrôleur pour la gestion des habitats en tant qu'admin.
 * Protégé par les gardes d'authentification et de rôles.
 */
@Controller('admin/habitats')
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
  @Roles('admin')
  @Get()
  async getAllHabitats(): Promise<Habitat[]> {
    return this.habitatService.getAllHabitats();
  }

  /**
   * Crée un nouvel habitat avec image.
   * Utilise le rôle "admin" pour limiter l'accès à cette opération.
   * Intercepte l'upload de fichier pour sauvegarder l'image de l'habitat.
   * @param habitatData Données de l'habitat partiellement remplies
   * @param image Fichier d'image téléchargé pour l'habitat
   * @returns La promesse de l'objet Habitat créé
   * @throws BadRequestException Si le fichier image est manquant
   */
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptionsHabitats))
  async createHabitat(
    @Body() habitatData: Partial<Habitat>,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Habitat> {
    if (!image) {
      throw new BadRequestException('Le champ image est obligatoire');
    }

    habitatData.images = `uploads/habitats/${image.filename}`;

    return this.habitatService.createHabitat(habitatData, 'admin');
  }

  /**
   * Met à jour les informations d'un habitat existant.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'habitat à mettre à jour
   * @param habitatData Nouvelles données de l'habitat partiellement remplies
   * @param image Fichier d'image téléchargé pour l'habitat
   * @returns La promesse de l'objet Habitat mis à jour
   */
  @Roles('admin')
  @Put(':id')
  @UseInterceptors(FileInterceptor('images', multerOptionsHabitats))
  async updateHabitat(
    @Param('id') id: number,
    @Body() habitatData: Partial<Habitat>,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Habitat> {

    // Vérifier si l'habitat existe
    const existingHabitat = await this.habitatService.findOne(id);
    if (!existingHabitat) {
      throw new NotFoundException(`Habitat avec ID ${id} non trouvé`);
    }

    // Gestion de l'image
    if (image) {
      habitatData.images = `uploads/habitats/${image.filename}`;
      console.log('Nouvelle image:', habitatData.images);
    } else if (!habitatData.images || habitatData.images === '{}') {
      habitatData.images = existingHabitat.images;
      console.log("Conservation de l'image existante:", habitatData.images);
    }

    console.log('Données finales à mettre à jour:', habitatData);
    const result = await this.habitatService.updateHabitat(
      id,
      habitatData,
      'admin',
    );
    console.log('Résultat de la mise à jour:', result);
    return result;
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
