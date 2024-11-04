import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { query } from '../../../../config/postgres.config';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/admin-dashboard/account-management/models/user.model';
import { Role } from 'src/modules/admin-dashboard/account-management/models/role.model';

@Injectable()
export class AccountService {
  // Récupère tous les utilisateurs avec leurs rôles
  async getAllUsers(): Promise<User[]> {
    const res = await query(`
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "roleId", roles.name AS role_name
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
    `);
    return res.rows.map((user) => this.formatUser(user));
  }

  // Récupère tous les rôles
  async getAllRoles(): Promise<Role[]> {
    const res = await query('SELECT * FROM roles');
    return res.rows;
  }

  // Crée un nouvel utilisateur
  async createUser(userData: Partial<User>, userRole: string): Promise<User> {
    this.checkAdminRole(userRole);
    if (!userData.roleId) {
      throw new BadRequestException("Le rôle de l'utilisateur est requis.");
    }
    const role = await this.findRoleById(userData.roleId);
    if (!role) {
      throw new NotFoundException(
        `Rôle avec l'ID ${userData.roleId} non trouvé`,
      );
    }

    const hashedPassword = await this.hashPassword(userData.password);
    const res = await query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.name, userData.email, hashedPassword, userData.roleId],
    );

    const newUser = res.rows[0];
    newUser.role = role;
    return this.formatUser(newUser);
  }

  // Met à jour un utilisateur
  async updateUser(
    id: number,
    userData: Partial<User>,
    userRole: string,
  ): Promise<User> {
    this.checkAdminRole(userRole);

    // Vérifiez d'abord si l'utilisateur existe
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Préparez les champs à mettre à jour en utilisant `COALESCE` uniquement pour ceux présents
    const name = userData.name || null;
    const email = userData.email || null;
    const password = userData.password
      ? await this.hashPassword(userData.password)
      : null;
    const roleId = userData.roleId || null;

    const res = await query(
      `UPDATE users SET 
        name = COALESCE($1, name), 
        email = COALESCE($2, email), 
        password = COALESCE($3, password), 
        role_id = COALESCE($4, role_id) 
      WHERE id = $5 RETURNING *`,
      [name, email, password, roleId, id],
    );

    const updatedUser = res.rows[0];
    const role = userData.roleId
      ? await this.findRoleById(userData.roleId)
      : user.role;

    updatedUser.role = role || { id: 0, name: 'Rôle non défini' };
    return this.formatUser(updatedUser);
  }

  // Supprime un utilisateur
  async deleteUser(id: number, userRole: string): Promise<{ message: string }> {
    this.checkAdminRole(userRole);

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
  }

  // Récupère un utilisateur par ID avec son rôle
  async findOne(id: number): Promise<User> {
    const res = await query(
      `
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "roleId", roles.name AS role_name
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
    `,
      [id],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.formatUser(res.rows[0]);
  }

  // Récupère un utilisateur par e-mail avec son rôle
  async findByEmail(email: string): Promise<User> {
    const res = await query(
      `
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "roleId", roles.name AS role_name
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
      WHERE users.email = $1
    `,
      [email],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.formatUser(res.rows[0]);
  }

  // Récupère un rôle par ID
  async findRoleById(id: number): Promise<Role | null> {
    const res = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  // Hash le mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Vérifie que l'utilisateur a un rôle admin
  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

  // Formate les informations de l'utilisateur avec son rôle
  private formatUser(user: any): User {
    return {
      ...user,
      role: user.role || {
        id: user.role_id || 0,
        name: user.role_name || 'Rôle non défini',
      },
    };
  }
}
