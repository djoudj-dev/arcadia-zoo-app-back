import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VeterinaryReports } from '../models/veterinary-reports.model';
import * as mongoose from 'mongoose';

@Injectable()
export class VeterinaryReportsService {
  constructor(
    @InjectModel('VeterinaryReports')
    private readonly veterinaryReportsModel: Model<VeterinaryReports>,
  ) {}

  async getAllVeterinaryReports(): Promise<VeterinaryReports[]> {
    return await this.veterinaryReportsModel.find().exec();
  }

  async getVeterinaryReportById(id: string): Promise<VeterinaryReports> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de rapport invalide');
      }

      const report = await this.veterinaryReportsModel.findById(id).exec();
      if (!report) {
        throw new NotFoundException('Rapport vétérinaire non trouvé');
      }
      return report;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la récupération du rapport',
      );
    }
  }

  async createVeterinaryReport(
    report: VeterinaryReports,
  ): Promise<VeterinaryReports> {
    const newReport = new this.veterinaryReportsModel(report);
    return await newReport.save();
  }

  async updateVeterinaryReport(
    id: string,
    report: Partial<VeterinaryReports>,
  ): Promise<VeterinaryReports> {
    const updatedReport = await this.veterinaryReportsModel
      .findByIdAndUpdate(id, report, { new: true })
      .exec();
    if (!updatedReport) {
      throw new NotFoundException('Rapport vétérinaire non trouvé');
    }
    return updatedReport;
  }

  async deleteVeterinaryReport(id: string): Promise<void> {
    const result = await this.veterinaryReportsModel
      .findByIdAndDelete(id)
      .exec();
    if (!result) {
      throw new NotFoundException('Rapport vétérinaire non trouvé');
    }
  }

  async updateReportStatus(
    id: string,
    is_processed: boolean,
  ): Promise<VeterinaryReports> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de rapport invalide');
      }

      const report = await this.veterinaryReportsModel
        .findByIdAndUpdate(id, { is_treated: is_processed }, { new: true })
        .exec();

      if (!report) {
        throw new NotFoundException('Rapport vétérinaire non trouvé');
      }

      return report;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du statut',
      );
    }
  }
}
