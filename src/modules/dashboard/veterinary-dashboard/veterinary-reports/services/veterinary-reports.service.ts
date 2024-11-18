import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VeterinaryReports } from '../models/veterinary-reports.model';

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
    const report = await this.veterinaryReportsModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException('Rapport vétérinaire non trouvé');
    }
    return report;
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
}
