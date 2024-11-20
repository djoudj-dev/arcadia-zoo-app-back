export interface OpeningHours {
  openingHours: Array<{
    days: string;
    hours: string;
    isOpen: boolean;
  }>;
  parkStatus: boolean;
  statusMessage: string;
  isCurrent?: boolean;
  updatedAt?: Date;
  _id?: string;
}

export class ParkStatus {
  isOpen!: boolean;
  message?: string;
}
