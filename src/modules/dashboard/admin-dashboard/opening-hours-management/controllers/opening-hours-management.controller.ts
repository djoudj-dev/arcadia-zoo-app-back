import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OpeningHours, ParkStatus } from '../models/opening-hours.model';
import { OpeningHoursService } from '../services/opening-hours.service';

/** Gestion des horaires d'ouverture du parc */
@Controller('opening-hours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OpeningHoursManagementController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}

  /** Récupère les horaires d'ouverture actuels */
  @Get('current')
  @Public()
  async getCurrentOpeningHours(): Promise<OpeningHours> {
    try {
      const currentHours =
        await this.openingHoursService.getCurrentOpeningHours();
      if (!currentHours) {
        throw new NotFoundException("Aucun horaire d'ouverture trouvé");
      }
      return currentHours;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des horaires d'ouverture actuels",
      );
    }
  }

  /** Liste toutes les configurations d'horaires */
  @Get()
  async getAllOpeningHours(): Promise<OpeningHours[]> {
    return this.openingHoursService.getAllOpeningHours();
  }

  /** Récupère une configuration d'horaires par ID */
  @Get(':id')
  async getOpeningHoursById(@Param('id') id: string): Promise<OpeningHours> {
    return this.openingHoursService.getOpeningHoursById(id);
  }

  /** Crée une nouvelle configuration d'horaires */
  @Post()
  @Roles('admin')
  async createOpeningHours(
    @Body() openingHoursData: Partial<OpeningHours>,
  ): Promise<OpeningHours> {
    return this.openingHoursService.createOpeningHours(openingHoursData);
  }

  /** Met à jour le statut d'ouverture du parc */
  @Put('status')
  @Roles('admin')
  async updateParkStatus(@Body() status: ParkStatus): Promise<ParkStatus> {
    try {
      if (typeof status.isOpen !== 'boolean') {
        throw new BadRequestException('Le statut isOpen doit être un booléen');
      }
      return await this.openingHoursService.updateParkStatus(status);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du statut du parc',
      );
    }
  }

  /** Met à jour une configuration d'horaires */
  @Put(':id')
  @Roles('admin')
  async updateOpeningHours(
    @Param('id') id: string,
    @Body() data: OpeningHours,
  ): Promise<OpeningHours> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        `L'ID ${id} n'est pas un ObjectId MongoDB valide`,
      );
    }

    console.log('Données reçues:', data);

    if (!id) {
      throw new BadRequestException('ID non défini');
    }

    if (!data.openingHours || !Array.isArray(data.openingHours)) {
      throw new BadRequestException('Les horaires sont invalides');
    }

    // Validation des données
    const weekdayHours = data.openingHours.find(
      (h) => h.days === 'Lundi - Vendredi',
    )?.hours;
    const weekendHours = data.openingHours.find(
      (h) => h.days === 'Samedi - Dimanche',
    )?.hours;

    if (weekdayHours && !this.isValidTimeFormat(weekdayHours.trim())) {
      console.log('Format weekdayHours invalide:', weekdayHours);
      throw new BadRequestException('Format des horaires de semaine invalide');
    }

    if (weekendHours && !this.isValidTimeFormat(weekendHours.trim())) {
      console.log('Format weekendHours invalide:', weekendHours);
      throw new BadRequestException('Format des horaires de weekend invalide');
    }

    try {
      return await this.openingHoursService.updateOpeningHours(id, data);
    } catch (error) {
      console.error('Erreur complète:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour des horaires d'ouverture",
      );
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeFormat =
      /^([0-1]?[0-9]|2[0-3])h[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3])h[0-5][0-9]$/;
    return timeFormat.test(time);
  }

  /** Supprime une configuration d'horaires */
  @Delete(':id')
  @Roles('admin')
  async deleteOpeningHours(@Param('id') id: string): Promise<void> {
    return this.openingHoursService.deleteOpeningHours(id);
  }
}
