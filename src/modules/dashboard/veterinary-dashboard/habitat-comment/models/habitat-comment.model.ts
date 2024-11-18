export interface HabitatComment {
  id_habitat_comment?: string;
  id_habitat: number;
  habitat_name: string;
  id_user: number;
  user_name: string;
  comment: string;
  habitat_status: 'Optimal' | 'Acceptable' | 'Nécessite des améliorations';
  is_resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
