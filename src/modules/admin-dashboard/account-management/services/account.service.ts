import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { query } from '../../../../config/postgres.config';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

/**
 * Service pour la gestion des comptes utilisateur, incluant les opérations CRUD et la gestion des rôles.
 */
@Injectable()
export class AccountService {
  /**
   * Récupère tous les utilisateurs avec leurs rôles associés.
   * @returns Une promesse d'un tableau d'objets User
   */
  async getAllUsers(): Promise<User[]> {
    const res = await query(`
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "role_id", roles.name AS role_name
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
    `);
    return res.rows.map((user) => this.formatUser(user));
  }

  /**
   * Récupère tous les rôles disponibles.
   * @returns Une promesse d'un tableau d'objets Role
   */
  async getAllRoles(): Promise<Role[]> {
    const res = await query('SELECT * FROM roles');
    return res.rows;
  }

  /**
   * Crée un nouvel utilisateur après vérification des autorisations et du rôle.
   * @param userData Données partielles de l'utilisateur à créer
   * @param userRole Rôle de l'utilisateur qui effectue l'opération (doit être admin)
   * @returns La promesse de l'objet User créé
   * @throws BadRequestException Si le rôle de l'utilisateur est manquant
   * @throws NotFoundException Si le rôle spécifié n'existe pas
   */
  async createUser(userData: Partial<User>, userRole: string): Promise<User> {
    this.checkAdminRole(userRole);
    if (!userData.role_id) {
      throw new BadRequestException("Le rôle de l'utilisateur est requis.");
    }
    const role = await this.findRoleById(userData.role_id);
    if (!role) {
      throw new NotFoundException(
        `Rôle avec l'ID ${userData.role_id} non trouvé`,
      );
    }

    const hashedPassword = userData.password
      ? await this.hashPassword(userData.password)
      : '';
    const res = await query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.name, userData.email, hashedPassword, userData.role_id],
    );

    const newUser = res.rows[0];
    newUser.role = role;
    return this.formatUser(newUser);
  }

  /**
   * Met à jour les informations d'un utilisateur existant.
   * @param id Identifiant de l'utilisateur à mettre à jour
   * @param userData Nouvelles données partielles de l'utilisateur
   * @param userRole Rôle de l'utilisateur qui effectue l'opération (doit être admin)
   * @returns La promesse de l'objet User mis à jour
   * @throws NotFoundException Si l'utilisateur spécifié n'existe pas
   */
  async updateUser(
    id: number,
    userData: Partial<User>,
    userRole: string,
  ): Promise<User> {
    this.checkAdminRole(userRole);

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const name = userData.name || null;
    const email = userData.email || null;
    const password = userData.password
      ? await this.hashPassword(userData.password)
      : null;
    const role_id = userData.role_id || null;

    const res = await query(
      `UPDATE users SET 
        name = COALESCE($1, name), 
        email = COALESCE($2, email), 
        password = COALESCE($3, password), 
        role_id = COALESCE($4, role_id) 
      WHERE id = $5 RETURNING *`,
      [name, email, password, role_id, id],
    );

    const updatedUser = res.rows[0];
    const role = userData.role_id
      ? await this.findRoleById(userData.role_id)
      : user.role;

    updatedUser.role = role || { id: 0, name: 'Rôle non défini' };
    return this.formatUser(updatedUser);
  }

  /**
   * Supprime un utilisateur spécifié.
   * @param id Identifiant de l'utilisateur à supprimer
   * @param userRole Rôle de l'utilisateur qui effectue l'opération (doit être admin)
   * @returns Un message de confirmation de suppression
   * @throws NotFoundException Si l'utilisateur spécifié n'existe pas
   */
  async deleteUser(id: number, userRole: string): Promise<{ message: string }> {
    this.checkAdminRole(userRole);

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
  }

  /**
   * Récupère un utilisateur par son ID, incluant son rôle.
   * @param id Identifiant de l'utilisateur
   * @returns La promesse de l'objet User correspondant
   * @throws NotFoundException Si l'utilisateur n'existe pas
   */
  async findOne(id: number): Promise<User> {
    const res = await query(
      `
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "role_id", roles.name AS role_name
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

  /**
   * Récupère un utilisateur par son adresse e-mail, incluant son rôle.
   * @param email Adresse e-mail de l'utilisateur
   * @returns La promesse de l'objet User correspondant
   * @throws NotFoundException Si l'utilisateur n'existe pas
   */
  async findByEmail(email: string): Promise<User> {
    const res = await query(
      `
      SELECT users.id, users.name, users.email, users.password, users.role_id AS "role_id", roles.name AS role_name
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

  /**
   * Récupère un rôle par son ID.
   * @param id Identifiant du rôle
   * @returns La promesse d'un objet Role ou null si le rôle n'existe pas
   */
  async findRoleById(id: number): Promise<Role | null> {
    const res = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  /**
   * Hash le mot de passe de manière sécurisée.
   * @param password Mot de passe en texte clair
   * @returns Une promesse de la chaîne de caractères du mot de passe hashé
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérifie si l'utilisateur a le rôle 'admin'.
   * @param userRole Rôle de l'utilisateur effectuant l'opération
   * @throws ForbiddenException Si l'utilisateur n'est pas admin
   */
  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Seuls les administrateurs peuvent effectuer cette action',
      );
    }
  }

  /**
   * Formate les informations d'un utilisateur en ajoutant son rôle.
   * @param user Données brutes de l'utilisateur
   * @returns Un objet User avec le rôle formaté
   */
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
