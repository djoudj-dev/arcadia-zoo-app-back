import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AnimalService } from '../services/animal.service';
import { Animal } from '../models/animal.model';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptionsAnimals } from 'src/config/multer.config';

/**
 * Contrôleur pour la gestion des animaux en tant qu'admin.
 * Protégé par les gardes d'authentification et de rôles.
 */
@Controller('admin/animal-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnimalController {
  /**
   * Injection du service AnimalService pour accéder aux opérations de gestion d'animal.
   * @param animalService Service pour les opérations CRUD des animaux
   */
  constructor(private readonly animalService: AnimalService) {}

  /**
   * Récupère tous les animaux existants.
   * @returns Une promesse d'un tableau d'objets Animal
   */
  @Get()
  async getAllAnimals(): Promise<Animal[]> {
    return this.animalService.getAllAnimals();
  }

  /**
   * Crée un nouvel animal avec image.
   * Utilise le rôle "admin" pour limiter l'accès à cette opération.
   * Intercepte l'upload de fichier pour sauvegarder l'image de l'animal.
   * @param animalData Données de l'animal partiellement remplies
   * @param images Fichier d'image téléchargé pour l'animal
   * @returns La promesse de l'objet Animal créé
   * @throws BadRequestException Si le fichier image est manquant
   */
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptionsAnimals))
  async createAnimal(
    @Body() animalData: Partial<Animal>,
    @UploadedFile() images: Express.Multer.File,
  ): Promise<Animal> {
    if (images) {
      animalData.images = `uploads/animals/${images.filename}`;
    } else {
      console.error('Le champ "images" est requis.');
      throw new BadRequestException('Le champ "images" est requis.');
    }
    return this.animalService.createAnimal(animalData, 'admin');
  }

  /**
   * Met à jour un animal existant.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'animal à mettre à jour
   * @param animalData Données de l'animal partiellement remplies
   * @returns La promesse de l'objet Animal mis à jour
   */
  @Roles('admin')
  @Put(':id')
  @UseInterceptors(FileInterceptor('images', multerOptionsAnimals))
  async updateAnimal(
    @Param('id') id: number,
    @Body() animalData: Partial<Animal>,
    @UploadedFile() images?: Express.Multer.File,
  ): Promise<Animal> {
    if (images) {
      animalData.images = `uploads/animals/${images.filename}`;
    }
    return this.animalService.updateAnimal(id, animalData, 'admin');
  }

  /**
   * Supprime un animal existant.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'animal à supprimer
   * @returns La promesse de l'objet Animal supprimé
   */
  @Roles('admin')
  @Delete(':id')
  async deleteAnimal(@Param('id') id: number): Promise<Animal> {
    return this.animalService.deleteAnimal(id, 'admin');
  }
}
