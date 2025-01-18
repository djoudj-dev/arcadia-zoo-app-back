import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/modules/mail/service/mail.service';
import { query } from '../../../../../config/postgres.config';
import { CreateUserDto } from '../dto/create-user.dto';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';

/**
 * Service pour la gestion des comptes utilisateur, incluant les opérations CRUD et la gestion des rôles.
 */
@Injectable()
export class AccountService {
  constructor(
    @Inject(forwardRef(() => MailService))
    readonly mailService: MailService,
  ) {}

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
  async createUser(userData: CreateUserDto, userRole: string): Promise<User> {
    try {
      this.checkAdminRole(userRole);

      // Vérifier si l'email existe déjà
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [
        userData.email,
      ]);

      if (existingUser.rows.length > 0) {
        throw new ConflictException(
          'Un utilisateur avec cet email existe déjà',
        );
      }

      const role = await this.findRoleById(userData.role_id);
      if (!role) {
        throw new NotFoundException(
          `Rôle avec l'ID ${userData.role_id} non trouvé`,
        );
      }

      // Générer un mot de passe temporaire
      const temporaryPassword = this.generateTemporaryPassword();
      const hashedPassword = await this.hashPassword(temporaryPassword);

      const res = await query(
        `INSERT INTO users (name, email, password, role_id, password_change_required, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, true, NOW(), NOW()) 
         RETURNING *`,
        [userData.name, userData.email, hashedPassword, userData.role_id],
      );

      const newUser = res.rows[0];
      newUser.role = role;

      // Envoyer l'email de bienvenue
      await this.mailService.sendWelcomeEmail(
        { name: newUser.name, email: newUser.email },
        temporaryPassword,
      );

      return this.formatUser(newUser);
    } catch (error: unknown) {
      console.error('Erreur service création utilisateur:', error);
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'utilisateur: " +
          (error instanceof Error ? error.message : 'Erreur inconnue'),
      );
    }
  }

  private generateTemporaryPassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
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

    const name = userData.name ?? null;
    const email = userData.email ?? null;
    const password = userData.password
      ? await this.hashPassword(userData.password)
      : null;
    const role_id = userData.role_id ?? null;

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
    console.log('Searching for user with email:', email);
    try {
      const res = await query(
        `
        SELECT users.id, users.name, users.email, users.password, users.role_id AS "role_id", roles.name AS role_name
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.email = $1
      `,
        [email],
      );

      console.log('Query result:', res.rows);

      if (res.rows.length === 0) {
        console.log('No user found with email:', email);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const user = this.formatUser(res.rows[0]);
      console.log('Formatted user:', user);
      return user;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
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

  /**
   * Met à jour le mot de passe d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param currentPassword Mot de passe actuel
   * @param newPassword Nouveau mot de passe
   * @returns Message de confirmation
   */
  async updatePassword(
    userId: number,
    currentPassword: string | null,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Récupérer l'utilisateur
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    // Si currentPassword est null, c'est une réinitialisation de mot de passe
    // Dans ce cas, on ne vérifie pas l'ancien mot de passe
    if (currentPassword !== null) {
      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Le mot de passe actuel est incorrect');
      }
    }

    // Hasher et enregistrer le nouveau mot de passe
    const hashedPassword = await this.hashPassword(newPassword);
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId],
    );

    // Envoyer l'email de confirmation
    await this.mailService.sendPasswordChangeConfirmation(user);

    return { message: 'Mot de passe mis à jour avec succès' };
  }
}
