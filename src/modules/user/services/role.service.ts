import { Injectable } from '@nestjs/common';
import { query } from '../../../config/postgres.config';

@Injectable()
export class RoleService {
  // Obtenir tous les rôles
  async findAll() {
    const res = await query('SELECT * FROM roles');
    return res.rows;
  }

  // Obtenir un rôle par ID
  async findOne(id: number) {
    const res = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }
}
