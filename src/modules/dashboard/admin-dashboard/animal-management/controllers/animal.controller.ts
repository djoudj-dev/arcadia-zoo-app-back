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
import fs from 'fs';
import path from 'path';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { multerOptionsAnimals } from '../../../../../config/multer.config';
import { Animal } from '../models/animal.model';
import { AnimalService } from '../services/animal.service';

@Controller('admin/animal-management')
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
    console.log('Données reçues:', { id, animalData, images });

    const existingAnimal = await this.animalService.findOne(id);
    if (!existingAnimal) {
      throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
    }

    if (images) {
      const oldImagePath = existingAnimal.images
        ? path.join(process.cwd(), existingAnimal.images)
        : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      animalData.images = `uploads/animals/${images.filename}`;
    }

    const updatedAnimalData: Partial<Animal> = {
      ...existingAnimal,
      ...animalData,
      images: images
        ? `uploads/animals/${images.filename}`
        : existingAnimal.images,
      updated_at: new Date(),
    };

    const updatedAnimal = await this.animalService.updateAnimal(
      id,
      updatedAnimalData,
      'admin',
    );

    console.log('Animal mis à jour:', updatedAnimal);

    if (!updatedAnimal) {
      throw new BadRequestException(
        "Erreur lors de la mise à jour de l'animal",
      );
    }

    return updatedAnimal;
  }

  @Roles('admin')
  @Delete(':id')
  async deleteAnimal(@Param('id') id: number): Promise<Animal> {
    return this.animalService.deleteAnimal(id, 'admin');
  }
}
