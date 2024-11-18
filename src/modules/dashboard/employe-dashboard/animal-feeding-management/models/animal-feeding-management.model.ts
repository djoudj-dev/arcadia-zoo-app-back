export interface AnimalFeedingManagement {
  readonly id_feeding: number;
  readonly animal_id: number;
  readonly feeding_date: Date;
  readonly food_type: string;
  readonly quantity: number;
  readonly unit: string;
  readonly notes?: string;
  readonly employe_id: number;
  readonly status: 'planned' | 'completed' | 'cancelled';
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly user_id: number;
  readonly user_name: string;
}
