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
import path from 'path';
import fs from 'fs';

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

    return this.animalService.updateAnimal(
      id,
      {
        ...existingAnimal,
        ...animalData,
      },
      'admin',
    );
  }

  @Roles('admin')
  @Delete(':id')
  async deleteAnimal(@Param('id') id: number): Promise<Animal> {
    return this.animalService.deleteAnimal(id, 'admin');
  }
}
