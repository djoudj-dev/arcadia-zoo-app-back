import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AccountService } from 'src/modules/dashboard/admin-dashboard/account-management/services/account.service';
import { VeterinaryReports } from '../models/veterinary-reports.model';
import { VeterinaryReportsService } from '../services/veterinary-reports.service';

@Controller('veterinary/reports')
export class VeterinaryReportsController {
  constructor(
    private readonly veterinaryReportsService: VeterinaryReportsService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Récupère tous les rapports vétérinaires
   * @returns Une promesse d'un tableau d'objets VeterinaryReports
   */
  @Get()
  async getAllVeterinaryReports(): Promise<VeterinaryReports[]> {
    try {
      return await this.veterinaryReportsService.getAllVeterinaryReports();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch veterinary reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère un rapport vétérinaire par son ID
   * @param id ID du rapport vétérinaire
   */
  @Get(':id')
  async getVeterinaryReportById(
    @Param('id') id: string,
  ): Promise<VeterinaryReports> {
    try {
      return await this.veterinaryReportsService.getVeterinaryReportById(id);
    } catch (error) {
      throw new HttpException(
        'Veterinary report not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Crée un nouveau rapport vétérinaire
   * @param report Données du rapport vétérinaire
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('veterinaire')
  async createVeterinaryReport(
    @Body() reportsCommentData: VeterinaryReports,
  ): Promise<VeterinaryReports> {
    try {
      return await this.veterinaryReportsService.createVeterinaryReport(
        reportsCommentData,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create veterinary report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Met à jour un rapport vétérinaire existant
   * @param id ID du rapport vétérinaire
   * @param report Données du rapport vétérinaire
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateVeterinaryReport(
    @Param('id') id: number,
    @Body() veterinaryReportsData: VeterinaryReports,
  ): Promise<VeterinaryReports | null> {
    try {
      return await this.veterinaryReportsService.updateVeterinaryReport(
        id.toString(),
        veterinaryReportsData,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to update veterinary report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Supprime un rapport vétérinaire
   * @param id ID du rapport vétérinaire
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteVeterinaryReport(@Param('id') id: string): Promise<void> {
    try {
      await this.veterinaryReportsService.deleteVeterinaryReport(id);
    } catch (error) {
      throw new HttpException(
        'Failed to delete veterinary report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateReportStatus(
    @Param('id') id: string,
    @Body('is_treated') is_processed: boolean,
  ): Promise<VeterinaryReports> {
    try {
      return await this.veterinaryReportsService.updateReportStatus(
        id,
        is_processed,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to update report status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère les rapports vétérinaires pour un animal spécifique
   * @param animalId ID de l'animal
   */
  @Get('animal/:id')
  async getReportsByAnimalId(
    @Param('id') animalId: string,
  ): Promise<VeterinaryReports[]> {
    try {
      return await this.veterinaryReportsService.getReportsByAnimalId(animalId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch veterinary reports for animal',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
