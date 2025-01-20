import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AnimalsService } from 'src/modules/animals-zoo/services/animals.service';
import { HabitatsService } from 'src/modules/habitats-zoo/services/habitats.service';
import { ServicesService } from 'src/modules/services-zoo/services/services.service';
import { TrackVisitDto } from '../dto/track-visit.dto';
import { VisitStats } from '../schema/visit-stats.schema';

@Injectable()
export class VisitStatsService implements OnModuleInit {
  private readonly apiUrl = 'http://localhost:3000/api/stats';

  constructor(
    @InjectModel(VisitStats.name)
    private readonly visitStatsModel: Model<VisitStats>,
    private readonly animalsService: AnimalsService,
    private readonly habitatsService: HabitatsService,
    private readonly servicesService: ServicesService,
    private readonly http: HttpService,
  ) {}

  async onModuleInit() {
    await this.initializeStats();
  }

  private async initializeStats() {
    try {
      // Récupérer toutes les données
      const animals = await this.animalsService.getAllAnimals();
      const habitats = await this.habitatsService.getAllHabitats();
      const services = await this.servicesService.getAllServices();

      // Créer les catégories pour chaque élément
      const categories = [
        ...animals.map((animal) => ({
          categoryName: animal.name,
          categoryType: 'animal',
          reference_id: animal.id_animal,
        })),
        ...habitats.map((habitat) => ({
          categoryName: habitat.name,
          categoryType: 'habitat',
          reference_id: habitat.id_habitat,
        })),
        ...services.map((service) => ({
          categoryName: service.name,
          categoryType: 'service',
          reference_id: service.id_service,
        })),
      ];

      // Vider la collection avant de réinitialiser
      await this.visitStatsModel.deleteMany({});

      // Initialiser les statistiques pour chaque élément
      for (const category of categories) {
        await this.visitStatsModel.create({
          ...category,
          visit_count: 0,
          visit_percentage: 0,
        });
      }

      console.log(
        `Statistiques initialisées pour ${categories.length} éléments`,
      );
    } catch (error) {
      console.error("Erreur lors de l'initialisation des statistiques:", error);
    }
  }

  async getAllStats(): Promise<VisitStats[]> {
    const stats = await this.visitStatsModel.find().exec();
    console.log('Statistiques récupérées:', stats);
    return stats;
  }

  async incrementVisits(categoryName: string): Promise<VisitStats> {
    console.log(`Incrémentation des visites pour: ${categoryName}`);

    // Vérifier si la catégorie existe
    const category = await this.visitStatsModel.findOne({
      categoryName,
    });
    if (!category) {
      console.error(`Catégorie non trouvée: ${categoryName}`);
      throw new Error(`Catégorie non trouvée: ${categoryName}`);
    }

    // Incrémenter le compteur de visites
    await this.visitStatsModel.findOneAndUpdate(
      { categoryName },
      { $inc: { visit_count: 1 } },
    );

    // Recalculer les pourcentages
    const allStats = await this.visitStatsModel.find();
    const totalVisits = allStats.reduce(
      (sum, stat) => sum + stat.visit_count,
      0,
    );

    console.log(`Total des visites: ${totalVisits}`);

    // Mettre à jour les pourcentages pour toutes les catégories
    const updatePromises = allStats.map((stat) => {
      const percentage =
        totalVisits > 0 ? (stat.visit_count / totalVisits) * 100 : 0;
      console.log(
        `${stat.categoryName}: ${stat.visit_count} visites, ${percentage}%`,
      );
      return this.visitStatsModel.findByIdAndUpdate(
        stat._id,
        { visit_percentage: percentage },
        { new: true },
      );
    });

    await Promise.all(updatePromises);
    const updatedCategory = await this.visitStatsModel.findOne({
      categoryName,
    });
    console.log(`Mise à jour terminée pour ${categoryName}:`, updatedCategory);
    return updatedCategory;
  }

  incrementVisit(categoryName: string) {
    console.log(`Enregistrement de la visite pour: ${categoryName}`);
    return this.http
      .post(`${this.apiUrl}/visits/increment`, { categoryName })
      .pipe(
        tap((response) => console.log('Réponse du serveur:', response)),
        catchError((error) => {
          console.error("Erreur lors de l'enregistrement de la visite:", error);
          return throwError(() => error);
        }),
      );
  }

  async trackVisit(trackVisitDto: TrackVisitDto) {
    const { categoryName, categoryType } = trackVisitDto;

    // Mettre à jour ou créer les statistiques pour cette catégorie
    const stats = await this.visitStatsModel.findOneAndUpdate(
      { categoryName, categoryType },
      {
        $inc: {
          visit_count: 1,
          total_duration: trackVisitDto.duration || 0,
        },
        $set: {
          last_visit: new Date(),
          pageId: trackVisitDto.pageId,
        },
      },
      { upsert: true, new: true },
    );

    // Recalculer la moyenne de durée
    if (trackVisitDto.duration) {
      stats.average_duration = stats.total_duration / stats.visit_count;
      await stats.save();
    }

    // Mettre à jour les pourcentages pour toutes les catégories
    await this.updatePercentages();

    return { success: true, message: 'Visite enregistrée avec succès' };
  }

  async getStatsByCategory(categoryType: string) {
    return this.visitStatsModel.find({ categoryType }).exec();
  }

  async getStatsByDateRange(startDate: Date, endDate: Date) {
    return this.visitStatsModel
      .find({
        last_visit: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec();
  }

  private async updatePercentages() {
    const allStats = await this.visitStatsModel.find();
    const totalVisits = allStats.reduce(
      (sum, stat) => sum + stat.visit_count,
      0,
    );

    const updatePromises = allStats.map((stat) => {
      const percentage =
        totalVisits > 0 ? (stat.visit_count / totalVisits) * 100 : 0;
      return this.visitStatsModel.findByIdAndUpdate(
        stat._id,
        { visit_percentage: percentage },
        { new: true },
      );
    });

    await Promise.all(updatePromises);
  }
}
