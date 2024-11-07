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
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { multerOptionsServices } from 'src/config/multer.config';
import { Feature } from '../models/feature.model';
import { Service } from '../models/service.model';
import { ServiceService } from '../services/service.service';

@Controller('admin/service-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', multerOptionsServices))
  async getAllServices(): Promise<Service[]> {
    return this.serviceService.getAllServices();
  }

  @Post()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', multerOptionsServices))
  async createService(
    @Body()
    serviceData: {
      // features is received as a JSON string
      name: string;
      description: string;
      features: string; // features is received as a JSON string
    },
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Service> {
    if (!image) {
      throw new BadRequestException('Le champ image est obligatoire');
    }

    // Convert features from JSON string to an array of Feature objects
    let parsedFeatures: Feature[];
    try {
      parsedFeatures = JSON.parse(serviceData.features);
    } catch {
      throw new BadRequestException('Le format de features est invalide');
    }

    // Set the image path in serviceData
    const serviceDataWithImage = {
      ...serviceData,
      images: `uploads/services/${image.filename}`,
    };

    return this.serviceService.createService(
      serviceDataWithImage,
      parsedFeatures,
      'admin',
    );
  }

  @Put(':id')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', multerOptionsServices))
  async updateService(
    @Param('id') id: number,
    @Body()
    serviceData: {
      name: string;
      description: string;
      images: string;
      features: string; // Reçu sous forme de chaîne JSON
    },
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Service> {
    if (image) {
      serviceData.images = `uploads/services/${image.filename}`;
    }

    // Convertit `features` de chaîne JSON en tableau d'objets Feature
    let parsedFeatures: Feature[];
    try {
      parsedFeatures = JSON.parse(serviceData.features);
    } catch {
      throw new BadRequestException('Le format de features est invalide');
    }

    // Appel à la méthode de service avec `parsedFeatures`
    return this.serviceService.updateService(
      {
        name: serviceData.name,
        description: serviceData.description,
        images: serviceData.images,
      },
      id,
      parsedFeatures, // Passer `parsedFeatures` au lieu de `serviceData.features`
      'admin',
    );
  }

  @Delete(':id')
  @Roles('admin')
  async deleteService(@Param('id') id: number): Promise<{ message: string }> {
    return this.serviceService.deleteService(id, 'admin');
  }
}