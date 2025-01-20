import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HabitatComment } from '../models/habitat-comment.model';

@Injectable()
export class HabitatCommentService {
  constructor(
    @InjectModel('HabitatComment')
    private readonly habitatCommentModel: Model<HabitatComment>,
  ) {}

  /**
   * Récupère tous les commentaires des habitats
   * @returns Une promesse d'un tableau d'objets HabitatComment
   */
  async getAllHabitatComments(): Promise<HabitatComment[]> {
    return await this.habitatCommentModel.find().exec();
  }

  /**
   * Récupère un commentaire d'habitat par son ID
   * @param id ID du commentaire d'habitat
   * @returns Une promesse d'un objet HabitatComment
   */
  async getHabitatCommentById(commentId: string): Promise<HabitatComment> {
    const comment = await this.habitatCommentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException(
        `Commentaire avec l'ID ${commentId} non trouvé`,
      );
    }
    return comment;
  }

  /**
   * Réupère les commentaires d'habitat par ID d'habitat
   * @param habitatId ID de l'habitat
   * @returns Une promesse d'un tableau d'objets HabitatComment
   */
  async getHabitatCommentByHabitatId(
    habitatId: number,
  ): Promise<HabitatComment[]> {
    console.log('Recherche des commentaires pour habitatId:', habitatId);
    const comments = await this.habitatCommentModel
      .find({ id_habitat: habitatId })
      .sort({ createdAt: -1 })
      .exec();
    console.log('Commentaires trouvés:', comments);
    return comments;
  }

  /**
   * Crée un nouveau commentaire d'habitat
   * @param habitatCommentData Données du commentaire d'habitat
   * @param userId ID de l'utilisateur créant le commentaire
   */
  async createHabitatComment(
    habitatCommentData: HabitatComment,
    userId: number,
    username: string,
  ): Promise<HabitatComment> {
    console.log('Données reçues:', habitatCommentData);

    // Vérification des données requises
    if (!userId || !username) {
      throw new Error('userId et username sont requis');
    }

    const newHabitatComment = new this.habitatCommentModel({
      id_habitat: Number(habitatCommentData.id_habitat),
      habitat_name: `Habitat ${habitatCommentData.id_habitat}`,
      id_user: userId,
      user_name: username,
      comment: habitatCommentData.comment,
      habitat_status: habitatCommentData.habitat_status,
      is_resolved: false,
    });

    console.log('Nouveau commentaire à sauvegarder:', newHabitatComment);
    return await newHabitatComment.save();
  }

  /**
   * Met à jour un commentaire d'habitat
   * @param id ID du commentaire à mettre à jour
   * @param habitatCommentData Nouvelles données du commentaire
   */
  async updateHabitatComment(
    id: string,
    habitatCommentData: Partial<HabitatComment>,
  ): Promise<HabitatComment | null> {
    return await this.habitatCommentModel
      .findByIdAndUpdate(
        id,
        { ...habitatCommentData, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  /**
   * Supprime un commentaire d'habitat
   * @param id ID du commentaire à supprimer
   */
  async deleteHabitatComment(id: string): Promise<void> {
    const result = await this.habitatCommentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Commentaire avec l'ID ${id} non trouvé`);
    }
  }

  /**
   * Marque un commentaire comme réglé
   */
  async resolveComment(
    commentId: string,
    userId: number,
  ): Promise<HabitatComment> {
    const updatedComment = await this.habitatCommentModel
      .findByIdAndUpdate(
        commentId,
        {
          is_resolved: true,
          resolved_at: new Date(),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedComment) {
      throw new NotFoundException(
        `Commentaire avec l'ID ${commentId} non trouvé`,
      );
    }

    return updatedComment;
  }

  /**
   * Réouvre un commentaire précédemment réglé
   */
  async reopenComment(commentId: string): Promise<HabitatComment> {
    const updatedComment = await this.habitatCommentModel
      .findByIdAndUpdate(
        commentId,
        {
          is_resolved: false,
          resolved_at: null,
          resolved_by: null,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedComment) {
      throw new NotFoundException(
        `Commentaire avec l'ID ${commentId} non trouvé`,
      );
    }

    return updatedComment;
  }
}
