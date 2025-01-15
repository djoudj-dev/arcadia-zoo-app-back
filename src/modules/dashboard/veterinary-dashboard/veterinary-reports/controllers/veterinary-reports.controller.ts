import {
  Body,
  Controller,
  Delete,
  Get,
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
    return this.veterinaryReportsService.getAllVeterinaryReports();
  }

  /**
   * Récupère un rapport vétérinaire par son ID
   * @param id ID du rapport vétérinaire
   */
  @Get(':id')
  async getVeterinaryReportById(
    @Param('id') id: string,
  ): Promise<VeterinaryReports> {
    return this.veterinaryReportsService.getVeterinaryReportById(id);
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
    return this.veterinaryReportsService.createVeterinaryReport(
      reportsCommentData,
    );
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
    return this.veterinaryReportsService.updateVeterinaryReport(
      id.toString(),
      veterinaryReportsData,
    );
  }

  /**
   * Supprime un rapport vétérinaire
   * @param id ID du rapport vétérinaire
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteVeterinaryReport(@Param('id') id: string): Promise<void> {
    return this.veterinaryReportsService.deleteVeterinaryReport(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateReportStatus(
    @Param('id') id: string,
    @Body('is_treated') is_processed: boolean,
  ): Promise<VeterinaryReports> {
    return this.veterinaryReportsService.updateReportStatus(id, is_processed);
  }
}
