import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
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

/**
 * Contrôleur pour la gestion des services en tant qu'admin.
 * Protégé par les gardes d'authentification et de rôles.
 */
@Controller('admin/service-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  /**
   * Injection du service ServiceService pour accéder aux opérations de gestion de service.
   * @param serviceService Service pour les opérations CRUD des services
   */
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * Récupère tous les services existants.
   * @returns Une promesse d'un tableau d'objets Service
   */
  @Get()
  async getAllServices(): Promise<Service[]> {
    return this.serviceService.getAllServices();
  }

  /**
   * Récupère les features d'un service spécifique.
   */
  @Get('features')
  async getAllFeatures(): Promise<Feature[]> {
    return this.serviceService.getAllFeatures();
  }

  /**
   * Crée un nouveau service avec les caractéristiques associées.
   * Et une image.
   * @param serviceData Objet Service à créer
   * @returns Une promesse de Service
   */
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('images', multerOptionsServices))
  async createService(
    @Body() serviceData: { name: string; description: string; images?: string },
    @UploadedFiles() images: Express.Multer.File,
  ): Promise<Service> {
    if (!images) {
      console.error('Le champ images est obligatoire');
      throw new BadRequestException('Le champ images est obligatoire');
    }
    serviceData.images = `uploads/services/${images.filename}`;
    return this.serviceService.createService(serviceData, 'admin');
  }
}
