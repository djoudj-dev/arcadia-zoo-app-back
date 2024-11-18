import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { VeterinaryReports } from '../models/veterinary-reports.model';
import { VeterinaryReportsService } from '../services/veterinary-reports.service';

@Controller('veterinary-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VeterinaryReportsController {
  constructor(
    private readonly veterinaryReportsService: VeterinaryReportsService,
  ) {}

  @Get()
  async getAllVeterinaryReports(): Promise<VeterinaryReports[]> {
    return this.veterinaryReportsService.getAllVeterinaryReports();
  }

  @Get(':id')
  async getVeterinaryReportById(
    @Param('id') id: string,
  ): Promise<VeterinaryReports> {
    return this.veterinaryReportsService.getVeterinaryReportById(id);
  }

  @Post()
  async createVeterinaryReport(
    @Body() report: VeterinaryReports,
  ): Promise<VeterinaryReports> {
    return this.veterinaryReportsService.createVeterinaryReport(report);
  }

  @Put(':id')
  async updateVeterinaryReport(
    @Param('id') id: string,
    @Body() report: Partial<VeterinaryReports>,
  ): Promise<VeterinaryReports> {
    return this.veterinaryReportsService.updateVeterinaryReport(id, report);
  }

  @Delete(':id')
  async deleteVeterinaryReport(@Param('id') id: string): Promise<void> {
    await this.veterinaryReportsService.deleteVeterinaryReport(id);
  }
}
