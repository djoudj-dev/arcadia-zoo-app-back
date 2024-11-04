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
import { multerOptions } from 'src/config/multer.config';

@Controller('admin/habitat-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HabitatController {
  constructor(private readonly habitatService: HabitatService) {}

  @Get()
  async getAllHabitats(): Promise<Habitat[]> {
    return this.habitatService.getAllHabitats();
  }

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptions))
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

  @Roles('admin')
  @Put(':id')
  async updateHabitat(
    @Param('id') id: number,
    @Body() habitatData: Partial<Habitat>,
  ): Promise<Habitat> {
    return this.habitatService.updateHabitat(id, habitatData, 'admin');
  }

  @Roles('admin')
  @Delete(':id')
  async deleteHabitat(@Param('id') id: number): Promise<{ message: string }> {
    return this.habitatService.deleteHabitat(id, 'admin');
  }
}
