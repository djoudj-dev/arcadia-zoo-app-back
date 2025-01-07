import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { UserOpinions } from '../model/user-opinions.model';

@Injectable()
export class UserOpinionsService {
  /**
   * Constructeur du service UserOpinions
   * @param userOpinionsModel Modèle Mongoose pour les avis utilisateurs
   */
  constructor(
    @InjectModel('UserOpinions') private userOpinionsModel: Model<UserOpinions>,
  ) {}

  /**
   * Récupère tous les avis utilisateurs qui ont été validés
   * @returns Une promesse contenant un tableau d'avis validés
   */
  async getValidatedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsModel.find({ validated: true }).lean().exec();
  }

  /**
   * Récupère tous les avis utilisateurs sans filtrage
   * @returns Une promesse contenant un tableau de tous les avis
   */
  async getAllUserOpinions(sort?: string): Promise<UserOpinions[]> {
    let query = this.userOpinionsModel.find();

    if (sort) {
      const [field, order] = sort.split(',');
      const sortOrder = order === 'desc' ? -1 : 1;
      query = query.sort({ [field]: sortOrder });
    }

    return query.lean().exec();
  }

  /**
   * Crée un nouvel avis utilisateur
   * @param userOpinion L'objet contenant les données de l'avis à créer
   * @returns Une promesse contenant l'avis créé
   */
  async createUserOpinion(userOpinion: UserOpinions): Promise<UserOpinions> {
    try {
      const newUserOpinion = new this.userOpinionsModel(userOpinion);
      return await newUserOpinion.save();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  }

  /**
   * Met à jour un avis utilisateur existant
   * @param id Identifiant de l'avis à mettre à jour
   * @param userOpinion Nouvelles données de l'avis
   * @returns Une promesse contenant l'avis mis à jour ou null si non trouvé
   */
  async updateUserOpinion(
    id: string,
    userOpinion: Partial<UserOpinions>,
  ): Promise<UserOpinions | null> {
    try {
      return await this.userOpinionsModel
        .findByIdAndUpdate(id, userOpinion, { new: true })
        .exec();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  /**
   * Valide un avis utilisateur spécifique
   * @param id Identifiant de l'avis à valider
   * @throws BadRequestException si l'ID est invalide
   * @throws NotFoundException si l'avis n'est pas trouvé
   * @returns Une promesse contenant l'avis validé
   */
  async validateUserOpinions(id: string): Promise<UserOpinions> {
    if (!id || typeof id !== 'string') {
      console.error('❌ ID invalide:', id);
      throw new BadRequestException('ID invalide');
    }

    try {
      // Vérifier si l'ID est un ObjectId MongoDB valide
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('❌ ID non valide pour MongoDB:', id);
        throw new BadRequestException(
          `L'ID ${id} n'est pas un ObjectId valide`,
        );
      }

      console.log("🔎 Recherche de l'avis dans la base de données...");

      // Ajout d'une vérification directe dans MongoDB
      const exists = await this.userOpinionsModel.exists({ _id: id });
      console.log('Existence dans la BD:', exists);

      const userOpinion = await this.userOpinionsModel.findById(id).exec();
      console.log('Résultat de la recherche:', userOpinion);

      if (!userOpinion) {
        console.error("❌ Avis non trouvé pour l'ID:", id);
        throw new NotFoundException(
          `Avis utilisateur avec l'id ${id} non trouvé`,
        );
      }

      // Vérifier si l'avis est déjà validé
      if (userOpinion.validated) {
        console.log('⚠️ Avis déjà validé');
        throw new BadRequestException(`L'avis ${id} est déjà validé`);
      }

      console.log('✅ Avis trouvé:', userOpinion);

      userOpinion.validated = true;
      userOpinion.accepted = true;
      userOpinion.updated_at = new Date();

      const savedOpinion = await userOpinion.save();
      console.log('💾 Avis sauvegardé avec succès:', savedOpinion);

      return savedOpinion;
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      throw error;
    }
  }

  /**
   * Supprime un avis utilisateur
   * @param id Identifiant de l'avis à supprimer
   * @returns Une promesse contenant l'avis supprimé ou null si non trouvé
   */
  async deleteUserOpinion(id: string): Promise<UserOpinions | null> {
    try {
      return await this.userOpinionsModel.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les avis en attente de validation
   * @returns Une promesse contenant un tableau des avis en attente
   * @note Retourne uniquement les champs id_opinion, name, date, message et rating
   */
  async getPendingUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsModel
      .find({
        validated: false,
        accepted: false,
      })
      .select('id_opinion name date message rating')
      .lean()
      .exec();
  }

  /**
   * Refuse un avis utilisateur spécifique
   * @param id Identifiant de l'avis à refuser
   * @throws BadRequestException si l'ID est invalide
   * @throws NotFoundException si l'avis n'est pas trouvé
   * @returns Une promesse contenant l'avis refusé
   */
  async rejectUserOpinion(id: string): Promise<UserOpinions> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('ID invalide');
    }

    const userOpinion = await this.userOpinionsModel.findById(id);

    if (!userOpinion) {
      throw new NotFoundException(
        `Avis utilisateur avec l'id ${id} non trouvé`,
      );
    }

    userOpinion.rejected = true;
    userOpinion.accepted = false;
    userOpinion.validated = false;
    return await userOpinion.save();
  }

  /**
   * Récupère tous les avis refusés
   * @returns Une promesse contenant un tableau des avis refusés
   */
  async getRejectedUserOpinions(): Promise<UserOpinions[]> {
    return this.userOpinionsModel
      .find({
        rejected: true,
      })
      .lean()
      .exec();
  }
}
