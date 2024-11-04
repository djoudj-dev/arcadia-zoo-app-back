import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleService } from 'src/modules/user/services/role.service';
import { UserService } from 'src/modules/user/services/user.service';
import { User } from 'src/modules/user/models/user.model';
import { Role } from 'src/modules/user/models/role.model';

@Injectable()
export class AccountService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Récupère tous les utilisateurs avec leurs rôles.
   * @returns Une liste d'utilisateurs avec les informations de rôle.
   */
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.findAll();

    return Promise.all(
      users.map(async (user) => {
        if (user.roleId !== null && user.roleId !== undefined) {
          console.log(
            `Tentative de récupération du rôle pour roleId: ${user.roleId}`,
          );
          const role = await this.roleService.findOne(user.roleId);

          if (role) {
            user.role = role;
          } else {
            console.warn(`Rôle introuvable pour roleId ${user.roleId}`);
            user.role = { id: 0, name: 'Rôle non défini' } as Role;
          }
        } else {
          console.warn(`Utilisateur ${user.id} n'a pas de roleId associé`);
          user.role = { id: 0, name: 'Rôle non défini' } as Role;
        }

        console.log(`Utilisateur traité:`, user); // Log pour vérification
        return user;
      }),
    );
  }

  /**
   * Crée un nouvel utilisateur.
   * @param userData - Les données de l'utilisateur à créer.
   * @returns L'utilisateur créé.
   */
  async createUser(userData: Partial<User>): Promise<User> {
    if (!userData.roleId) {
      throw new BadRequestException("Le rôle de l'utilisateur est requis.");
    }

    const role = await this.roleService.findOne(userData.roleId);
    if (!role) {
      throw new NotFoundException(
        `Rôle avec l'ID ${userData.roleId} non trouvé`,
      );
    }

    const newUser = await this.userService.create(userData, 'admin');
    newUser.role = role;

    console.log(`Nouvel utilisateur créé:`, newUser);
    return newUser;
  }

  /**
   * Met à jour les informations d'un utilisateur par ID.
   * @param id - L'ID de l'utilisateur à mettre à jour.
   * @param userData - Les nouvelles données de l'utilisateur.
   * @returns L'utilisateur mis à jour.
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const updatedUser = await this.userService.update(id, userData, 'admin');

    if (updatedUser.roleId) {
      const role = await this.roleService.findOne(updatedUser.roleId);
      updatedUser.role = role || ({ id: 0, name: 'Rôle non défini' } as Role);
    } else {
      updatedUser.role = { id: 0, name: 'Rôle non défini' } as Role;
    }

    console.log(`Utilisateur mis à jour:`, updatedUser);
    return updatedUser;
  }

  /**
   * Supprime un utilisateur par ID.
   * @param id - L'ID de l'utilisateur à supprimer.
   * @returns Un message de confirmation de suppression.
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    await this.userService.delete(id, 'admin');
    console.log(`Utilisateur supprimé: ID ${id}`);
    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
  }
}
