// Interface définissant la structure d'un avis utilisateur
export interface UserOpinions {
  // Identifiant unique auto-incrémenté
  readonly id_opinion: number;
  // Nom de l'utilisateur ayant soumis l'avis
  readonly name: string;
  // Date de soumission de l'avis (format string)
  readonly date: string;
  // Contenu du message/commentaire de l'avis
  readonly message: string;
  // Note attribuée par l'utilisateur (de 0 à 5)
  readonly rating: number;
  // Statut d'acceptation par un modérateur
  accepted: boolean;
  // Statut de validation selon les critères définis
  validated: boolean;
  // Date de publication (optionnelle)
  published_at?: Date;
  // Date de création automatique du document
  readonly created_at: Date;
  // Date de dernière modification automatique
  readonly updated_at: Date;
  // Statut de rejet par un modérateur
  rejected?: boolean;
}
