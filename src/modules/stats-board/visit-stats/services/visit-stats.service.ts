import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackVisitDto } from '../dto/track-visit.dto';
import { Visit } from '../schema/visit.schema';

@Injectable()
export class VisitStatsService {
  constructor(
    @InjectModel(Visit.name)
    private readonly visitModel: Model<Visit>,
  ) {}

  async getAllStats() {
    try {
      const stats = await this.visitModel.aggregate([
        {
          $group: {
            _id: {
              categoryName: '$categoryName',
              categoryType: '$categoryType',
            },
            visit_count: { $sum: 1 },
            total_duration: { $sum: '$duration' },
            last_visit: { $max: '$createdAt' },
          },
        },
        {
          $project: {
            _id: 0,
            category_name: '$_id.categoryName',
            category_type: '$_id.categoryType',
            visit_count: 1,
            total_duration: 1,
            average_duration: { $divide: ['$total_duration', '$visit_count'] },
            last_visit: 1,
          },
        },
      ]);

      const totalVisits = stats.reduce(
        (sum, stat) => sum + stat.visit_count,
        0,
      );
      const statsWithPercentage = stats.map((stat) => ({
        ...stat,
        visit_percentage:
          totalVisits > 0 ? (stat.visit_count / totalVisits) * 100 : 0,
      }));

      console.log('Statistiques calculées:', statsWithPercentage);
      return statsWithPercentage;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return [];
    }
  }

  async trackVisit(trackVisitDto: TrackVisitDto) {
    const visit = new this.visitModel(trackVisitDto);
    await visit.save();
    return { success: true, message: 'Visite enregistrée avec succès' };
  }

  async getStatsByCategory(categoryType: string) {
    const stats = await this.visitModel.aggregate([
      {
        $match: { categoryType },
      },
      {
        $group: {
          _id: {
            categoryName: '$categoryName',
            categoryType: '$categoryType',
          },
          visit_count: { $sum: 1 },
          total_duration: { $sum: '$duration' },
          last_visit: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          category_name: '$_id.categoryName',
          category_type: '$_id.categoryType',
          visit_count: 1,
          total_duration: 1,
          average_duration: { $divide: ['$total_duration', '$visit_count'] },
          last_visit: 1,
        },
      },
    ]);

    const totalVisits = stats.reduce((sum, stat) => sum + stat.visit_count, 0);

    return stats.map((stat) => ({
      ...stat,
      visit_percentage: (stat.visit_count / totalVisits) * 100,
    }));
  }

  async getStatsByDateRange(startDate: Date, endDate: Date) {
    const stats = await this.visitModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            categoryName: '$categoryName',
            categoryType: '$categoryType',
          },
          visit_count: { $sum: 1 },
          total_duration: { $sum: '$duration' },
          last_visit: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          category_name: '$_id.categoryName',
          category_type: '$_id.categoryType',
          visit_count: 1,
          total_duration: 1,
          average_duration: { $divide: ['$total_duration', '$visit_count'] },
          last_visit: 1,
        },
      },
    ]);

    const totalVisits = stats.reduce((sum, stat) => sum + stat.visit_count, 0);

    return stats.map((stat) => ({
      ...stat,
      visit_percentage: (stat.visit_count / totalVisits) * 100,
    }));
  }
}
