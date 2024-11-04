import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { query } from '../../../config/postgres.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  // Obtenir tous les utilisateurs
  async findAll() {
    const res = await query(`
    SELECT id, name, email, password, role_id AS "roleId"
    FROM users
  `);
    return res.rows;
  }

  // Obtenir un utilisateur par e-mail
  async findByEmail(email: string) {
    const res = await query(
      `
      SELECT users.id, users.name, users.email, users.password, users.role_id, roles.id as role_id, roles.name AS role_name
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
      WHERE users.email = $1
      `,
      [email],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const user = res.rows[0];
    // Reformate l'objet pour inclure un objet `role` complet
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: {
        id: user.role_id,
        name: user.role_name,
      },
    };
  }

  // Obtenir un utilisateur par ID
  async findOne(id: number) {
    const res = await query(
      `
      SELECT users.*, roles.name as role
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
    `,
      [id],
    );
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

    // Hashage du mot de passe avant de l'enregistrer
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const res = await query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, roleId],
    );
    return res.rows[0];
  }

  // Mettre à jour un utilisateur (réservé aux administrateurs)
  async update(id: number, userData: any, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update users');
    }
    const { name, email, password, roleId } = userData;

    // Hashage du mot de passe s'il est fourni dans les données de mise à jour
    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const res = await query(
      'UPDATE users SET name = $1, email = $2, password = COALESCE($3, password), role_id = $4 WHERE id = $5 RETURNING *',
      [name, email, hashedPassword || null, roleId, id],
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
