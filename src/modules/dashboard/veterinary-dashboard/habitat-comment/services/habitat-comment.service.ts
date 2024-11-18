import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from 'src/modules/dashboard/admin-dashboard/account-management/services/account.service';
import { HabitatService } from 'src/modules/dashboard/admin-dashboard/habitat-management/services/habitat.service';
import { HabitatComment } from '../models/habitat-comment.model';

@Injectable()
export class HabitatCommentService {
  constructor(
    @InjectModel('HabitatComment')
    private readonly habitatCommentModel: Model<HabitatComment>,
    private readonly accountService: AccountService,
    private readonly habitatService: HabitatService,
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
  async getHabitatCommentById(commentId: number): Promise<HabitatComment[]> {
    return await this.habitatCommentModel.find({ commentId: commentId }).exec();
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
  ): Promise<HabitatComment> {
    console.log('Données reçues:', habitatCommentData);

    const user = await this.accountService.findOne(userId);
    const habitat = await this.habitatService.findOne(
      habitatCommentData.id_habitat,
    );

    if (!habitat) {
      throw new NotFoundException(
        `Habitat avec l'ID ${habitatCommentData.id_habitat} non trouvé`,
      );
    }

    const newHabitatComment = new this.habitatCommentModel({
      ...habitatCommentData,
      id_habitat: Number(habitatCommentData.id_habitat),
      habitat_name: habitat.name,
      id_user: userId,
      user_name: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    id: number,
    habitatCommentData: Partial<HabitatComment>,
  ): Promise<HabitatComment | null> {
    return await this.habitatCommentModel
      .findOneAndUpdate(
        { id_habitat_comment: id },
        { ...habitatCommentData, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  /**
   * Supprime un commentaire d'habitat
   * @param id ID du commentaire à supprimer
   */
  async deleteHabitatComment(id: number): Promise<HabitatComment | null> {
    return await this.habitatCommentModel
      .findOneAndDelete({ id_habitat_comment: id })
      .exec();
  }

  /**
   * Marque un commentaire comme réglé
   */
  async resolveComment(
    commentId: string,
    userId: number,
  ): Promise<HabitatComment> {
    const user = await this.accountService.findOne(userId);

    const updatedComment = await this.habitatCommentModel
      .findByIdAndUpdate(
        commentId,
        {
          is_resolved: true,
          resolved_at: new Date(),
          resolved_by: user.name,
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
