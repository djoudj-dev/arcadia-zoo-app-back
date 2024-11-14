import { Injectable } from '@nestjs/common';
import { query } from '../../../../config/postgres.config';

@Injectable()
export class CountResourceService {
  async getStats(): Promise<any> {
    const [animalsCount, habitatsCount, servicesCount, employeCount, vetCount] =
      await Promise.all([
        this.getAnimalsCount(),
        this.getHabitatsCount(),
        this.getServicesCount(),
        this.getEmployeCount(),
        this.getVetCount(),
      ]);

    return {
      animals: animalsCount,
      habitats: habitatsCount,
      services: servicesCount,
      employe: employeCount,
      vet: vetCount,
    };
  }

  private async getAnimalsCount(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM animals');
    return parseInt(result.rows[0].count);
  }

  private async getHabitatsCount(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM habitats');
    return parseInt(result.rows[0].count);
  }

  private async getServicesCount(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM services');
    return parseInt(result.rows[0].count);
  }

  private async getEmployeCount(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = 1',
    );
    return parseInt(result.rows[0].count);
  }

  private async getVetCount(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = 2',
    );
    return parseInt(result.rows[0].count);
  }
}
