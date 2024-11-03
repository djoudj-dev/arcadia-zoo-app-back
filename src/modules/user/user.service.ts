import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { query } from '../../config/postgres.config';

@Injectable()
export class UserService {
  // Obtenir tous les utilisateurs
  async findAll() {
    const res = await query('SELECT * FROM users');
    return res.rows;
  }

  // Obtenir un utilisateur par ID
  async findOne(id: number) {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return res.rows[0];
  }

  // Créer un nouvel utilisateur (réservé aux administrateurs)
  async create(userData: any, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can create users');
    }
    const { name, email, password, roleId } = userData;
    const res = await query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, roleId],
    );
    return res.rows[0];
  }

  // Mettre à jour un utilisateur (réservé aux administrateurs)
  async update(id: number, userData: any, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update users');
    }
    const { name, email, password, roleId } = userData;
    const res = await query(
      'UPDATE users SET name = $1, email = $2, password = $3, role_id = $4 WHERE id = $5 RETURNING *',
      [name, email, password, roleId, id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return res.rows[0];
  }

  // Supprimer un utilisateur (réservé aux administrateurs)
  async delete(id: number, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }
    const res = await query('DELETE FROM users WHERE id = $1 RETURNING *', [
      id,
    ]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return res.rows[0];
  }
}
