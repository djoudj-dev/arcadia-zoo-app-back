import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { multerOptionsAnimals } from '../../../../../config/multer.config';
import { Animal } from '../models/animal.model';
import { AnimalService } from '../services/animal.service';

@Controller('admin/animals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Roles('admin')
  @Get()
  async getAllAnimals(): Promise<Animal[]> {
    return this.animalService.getAllAnimals();
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptionsAnimals))
  async createAnimal(
    @Body() animalData: Partial<Animal>,
    @UploadedFile() images: Express.Multer.File,
  ): Promise<Animal> {
    if (images) {
      animalData.images = images.filename;
    } else {
      throw new BadRequestException('Le champ "images" est requis.');
    }
    return this.animalService.createAnimal(animalData, 'admin');
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('images', multerOptionsAnimals))
  async updateAnimal(
    @Param('id') id: number,
    @Body() animalData: Partial<Animal>,
    @UploadedFile() images?: Express.Multer.File,
  ): Promise<Animal> {
    const getImagePath = (
      image?: Express.Multer.File,
      currentPath?: string | object,
    ): string => {
      if (image) {
        return image.filename;
      }

      if (
        !currentPath ||
        typeof currentPath !== 'string' ||
        currentPath === '{}'
      ) {
        return '';
      }

      // Extraire uniquement le nom du fichier (ex: 1737058531165-706421970-perroquet.webp)
      return currentPath.split('/').pop() || '';
    };

    const updateData: Partial<Animal> = {
      ...animalData,
      images: getImagePath(images, animalData.images),
    };

    console.log('Données finales envoyées au service:', updateData);

    try {
      const result = await this.animalService.updateAnimal(
        id,
        updateData,
        'admin',
      );
      console.log('Résultat de la mise à jour:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    } finally {
      console.log('=== FIN UPDATE ANIMAL ===');
    }
  }

  @Roles('admin')
  @Delete(':id')
  async deleteAnimal(@Param('id') id: number): Promise<Animal> {
    return this.animalService.deleteAnimal(id, 'admin');
  }
}
