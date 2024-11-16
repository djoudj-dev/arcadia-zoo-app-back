// service.controller.ts
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
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { multerOptionsServices } from '../../../../../config/multer.config';
import { Feature } from '../models/feature.model';
import { Service } from '../models/service.model';
import { ServiceService } from '../services/service.service';

@Controller('admin/service-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @Roles('admin', 'employe')
  @UseInterceptors(FileInterceptor('image', multerOptionsServices))
  async getAllServices(): Promise<Service[]> {
    return this.serviceService.getAllServices();
  }

  @Get('features')
  @Roles('admin', 'employe')
  async getAllFeatures(): Promise<Feature[]> {
    return this.serviceService.getAllFeatures();
  }

  @Post()
  @Roles('admin', 'employe')
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
  @Roles('admin', 'employe')
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
    @UploadedFile() image?: Express.Multer.File, // Image rendue optionnelle
  ): Promise<Service> {
    console.log('Image reçue :', image);

    // Mise à jour du chemin de l'image si un fichier est téléchargé
    if (image) {
      serviceData.images = `uploads/services/${image.filename}`;
    } else {
      // Conserver l'image existante si aucune nouvelle image n'est fournie
      const existingService = await this.serviceService.findById(id);
      if (!existingService) {
        throw new NotFoundException(`Service avec ID ${id} non trouvé`);
      }
      serviceData.images = existingService.images || ''; // Assurez-vous que `images` a une valeur par défaut

      // Conserver les `features` existantes si aucune n'est spécifiée
      if (!serviceData.features) {
        serviceData.features = JSON.stringify(existingService.features);
      }
    }

    console.log('Données reçues après ajustements :', serviceData);

    // Convertit `features` de chaîne JSON en tableau d'objets Feature
    let parsedFeatures: Feature[];
    try {
      parsedFeatures = JSON.parse(serviceData.features);

      // Vérification que chaque élément du tableau a les propriétés nécessaires
      if (
        !Array.isArray(parsedFeatures) ||
        parsedFeatures.some(
          (f) =>
            !f.name || // Assurez-vous que `name` est présent
            !f.type || // Assurez-vous que `type` est présent
            typeof f.name !== 'string' || // Vérification du type
            typeof f.type !== 'string', // Vérification du type
        )
      ) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException(
        'Le format de features est invalide ou manque des propriétés obligatoires.',
      );
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
  @Roles('admin', 'employe')
  async deleteService(@Param('id') id: number): Promise<{ message: string }> {
    return this.serviceService.deleteService(id, 'admin');
  }
}
