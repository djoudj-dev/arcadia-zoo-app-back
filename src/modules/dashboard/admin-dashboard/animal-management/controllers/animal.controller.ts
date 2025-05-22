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
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Animal> {
    // Vérifier si l'animal existe
    const existingAnimal = await this.animalService.findOne(id);
    if (!existingAnimal) {
      throw new NotFoundException(`Animal avec ID ${id} non trouvé`);
    }

    // Gestion de l'image
    if (image) {
      animalData.images = image.filename;
      console.log('Nouvelle image:', animalData.images);
    } else if (!animalData.images || animalData.images === '{}') {
      animalData.images = existingAnimal.images;
      console.log("Conservation de l'image existante:", animalData.images);
    }

    console.log('Données finales à mettre à jour:', animalData);
    const result = await this.animalService.updateAnimal(
      id,
      animalData,
      'admin',
    );
    console.log('Résultat de la mise à jour:', result);
    return result;
  }

  @Roles('admin')
  @Delete(':id')
  async deleteAnimal(@Param('id') id: number): Promise<Animal> {
    return this.animalService.deleteAnimal(id, 'admin');
  }
}
