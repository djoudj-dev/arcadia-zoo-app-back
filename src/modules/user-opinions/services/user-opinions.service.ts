import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { UserOpinions } from '../model/user-opinions.model';

@Injectable()
export class UserOpinionsService implements OnModuleInit {
  constructor(
    @InjectModel('UserOpinions') private userOpinionsModel: Model<UserOpinions>,
    @InjectConnection() private connection: Connection,
  ) {}

  async onModuleInit() {
    try {
      console.log('[UserOpinions] Démarrage du service...');

      // Synchronisation des avis manquants
      const defaultOpinions = [
        {
          _id: '67360376a16d66d871f850e6',
          name: 'John Doe',
          date: '2023-10-01',
          message: "C'est un excellent service !",
          rating: 5,
          validated: true,
          accepted: false,
        },
        {
          _id: '673610d79b58b13698a8d0ab',
          name: 'John Cage',
          date: '2023-10-01',
          message: "C'est un excellent service !",
          rating: 5,
          validated: true,
          accepted: false,
        },
      ];

      // Vérifier et mettre à jour ou créer les avis
      for (const opinion of defaultOpinions) {
        try {
          const existingDoc = await this.userOpinionsModel.findById(
            opinion._id,
          );
          if (!existingDoc) {
            console.log(`[UserOpinions] Création de l'avis:`, opinion._id);
            await this.userOpinionsModel.create({
              ...opinion,
              created_at: new Date(),
              updated_at: new Date(),
            });
          } else {
            console.log(`[UserOpinions] Mise à jour de l'avis:`, opinion._id);
            await this.userOpinionsModel.updateOne(
              { _id: opinion._id },
              {
                $set: {
                  ...opinion,
                  updated_at: new Date(),
                },
              },
            );
          }
        } catch (error) {
          console.error(
            `[UserOpinions] Erreur pour l'avis ${opinion._id}:`,
            error,
          );
        }
      }

      // Vérification finale
      const validatedDocs = await this.userOpinionsModel
        .find({ validated: true })
        .lean();
      console.log('[UserOpinions] Avis validés après synchronisation:');
      validatedDocs.forEach((doc) => {
        console.log(`ID: ${doc._id}`);
        console.log(`Name: ${doc.name}`);
        console.log(`Validated: ${doc.validated}`);
        console.log('---');
      });
    } catch (error) {
      console.error('[UserOpinions] Erreur critique:', error);
      throw error;
    }
  }

  async getAllUserOpinions(validated: boolean): Promise<UserOpinions[]> {
    try {
      console.log('[getAllUserOpinions] Recherche avec validated =', validated);

      // Requête avec plus de détails
      const result = await this.userOpinionsModel
        .find({ validated: { $eq: validated } })
        .lean()
        .exec();

      console.log('[getAllUserOpinions] Requête effectuée');
      console.log('[getAllUserOpinions] Nombre de résultats:', result.length);

      // Afficher chaque document trouvé
      result.forEach((doc) => {
        console.log('---');
        console.log('ID:', doc._id);
        console.log('Name:', doc.name);
        console.log('Validated:', doc.validated);
      });

      // Vérification supplémentaire
      const totalValidated = await this.userOpinionsModel.countDocuments({
        validated: true,
      });
      console.log(
        '[getAllUserOpinions] Total des documents validés:',
        totalValidated,
      );

      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[getAllUserOpinions] Erreur:', error.message);
      } else {
        console.error('[getAllUserOpinions] Erreur inconnue:', error);
      }
      throw error;
    }
  }

  async createUserOpinion(userOpinion: UserOpinions): Promise<UserOpinions> {
    try {
      console.log("Tentative de création d'un avis utilisateur...");
      console.log(
        'Base de données:',
        this.connection.db ? this.connection.db.databaseName : 'Non défini',
      );
      console.log(
        'Collections disponibles:',
        this.connection.db
          ? await this.connection.db.listCollections().toArray()
          : 'Non défini',
      );
      console.log('Données reçues:', userOpinion);

      const newUserOpinion = new this.userOpinionsModel(userOpinion);
      console.log('Document avant sauvegarde:', newUserOpinion);

      const savedOpinion = await newUserOpinion.save();
      console.log('Document sauvegardé avec succès:', savedOpinion);

      return savedOpinion;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[createUserOpinion] Erreur:', error.message);
      } else {
        console.error('[createUserOpinion] Erreur inconnue:', error);
      }
      throw error;
    }
  }

  async updateUserOpinion(
    id: string,
    userOpinion: Partial<UserOpinions>,
  ): Promise<UserOpinions | null> {
    try {
      console.log(
        "[updateUserOpinion] Tentative de mise à jour de l'avis:",
        id,
      );

      if (!Types.ObjectId.isValid(id)) {
        console.error('[updateUserOpinion] ID invalide:', id);
        return null;
      }

      const objectId = new Types.ObjectId(id);
      console.log('[updateUserOpinion] ObjectId:', objectId);

      const existingDoc = await this.userOpinionsModel.findById(objectId);
      console.log('[updateUserOpinion] Document existant:', existingDoc);

      if (!existingDoc) {
        console.log('[updateUserOpinion] Document non trouvé');
        return null;
      }

      const updateResult = await this.userOpinionsModel.updateOne(
        { _id: objectId },
        {
          $set: {
            ...userOpinion,
            updated_at: new Date(),
          },
        },
        { new: true },
      );

      console.log(
        '[updateUserOpinion] Résultat de la mise à jour:',
        updateResult,
      );

      if (updateResult.modifiedCount === 0) {
        console.log('[updateUserOpinion] Aucune modification effectuée');
        return null;
      }

      const updatedDoc = await this.userOpinionsModel.findById(objectId);
      console.log(
        '[updateUserOpinion] Document après mise à jour:',
        updatedDoc,
      );

      return updatedDoc;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[updateUserOpinion] Erreur:', error.message);
        console.error('[updateUserOpinion] Stack:', error.stack);
      } else {
        console.error('[updateUserOpinion] Erreur inconnue:', error);
      }
      throw error;
    }
  }

  async deleteUserOpinion(id: string): Promise<UserOpinions | null> {
    try {
      return await this.userOpinionsModel.findByIdAndDelete(id).exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[deleteUserOpinion] Erreur:', error.message);
      } else {
        console.error('[deleteUserOpinion] Erreur inconnue:', error);
      }
      throw error;
    }
  }

  async getValidationStats(): Promise<{ total: number; validated: number }> {
    const [total, validated] = await Promise.all([
      this.userOpinionsModel.countDocuments(),
      this.userOpinionsModel.countDocuments({ validated: true }),
    ]);
    return { total, validated };
  }

  async validateMultiple(ids: string[]): Promise<number> {
    const result = await this.userOpinionsModel.updateMany(
      { _id: { $in: ids } },
      { $set: { validated: true, updated_at: new Date() } },
    );
    return result.modifiedCount;
  }
}
