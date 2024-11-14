import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserOpinions } from '../model/user-opinions.model';

@Injectable()
export class UserOpinionsService implements OnModuleInit {
  constructor(
    @InjectModel('UserOpinions') private userOpinionsModel: Model<UserOpinions>,
    @InjectConnection() private connection: Connection,
  ) {}

  async onModuleInit() {
    try {
      console.log('Tentative de connexion à MongoDB...');
      console.log('URL de connexion:', process.env.MONGODB_URI);
      console.log('État de la connexion MongoDB:', this.connection.readyState);

      // Tester la connexion avec une requête simple
      await this.userOpinionsModel.findOne().exec();
      console.log('Connexion à MongoDB réussie !');
    } catch (error) {
      console.error('Erreur de connexion MongoDB:', error);
      console.error(
        'Veuillez vérifier que MongoDB est bien installé et démarré',
      );
    }
  }

  async getAllUserOpinions(validated: boolean): Promise<UserOpinions[]> {
    return await this.userOpinionsModel.find({ validated }).exec();
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
    } catch (error) {
      console.error('Erreur détaillée:', error);
      throw error;
    }
  }

  async updateUserOpinion(
    id: string,
    userOpinion: UserOpinions,
  ): Promise<UserOpinions | null> {
    return await this.userOpinionsModel
      .findByIdAndUpdate(id, userOpinion, { new: true })
      .exec();
  }

  async deleteUserOpinion(id: string): Promise<UserOpinions | null> {
    return await this.userOpinionsModel.findByIdAndDelete(id).exec();
  }
}
