export class UserOpinions {
  readonly id_opinion!: number;
  name!: string;
  date!: string;
  message!: string;
  rating!: number;
  accepted!: boolean;
  validated!: boolean;
  published_at?: Date;
  created_at!: Date;
  updated_at!: Date;
}
