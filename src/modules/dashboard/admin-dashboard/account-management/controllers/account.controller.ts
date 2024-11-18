import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../auth/guards/roles.guard';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { AccountService } from '../services/account.service';

/**
 * Contrôleur pour la gestion des comptes utilisateur et des rôles.
 * Accessible uniquement aux administrateurs via les gardes d'authentification et de rôles.
 */
@Controller('admin/account-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  /**
   * Injection du service AccountService pour la gestion des utilisateurs et des rôles.
   * @param accountService Service pour les opérations CRUD des comptes utilisateur et des rôles
   */
  constructor(private readonly accountService: AccountService) {}

  // Gestion des utilisateurs

  /**
   * Récupère tous les utilisateurs existants.
   * @returns Une promesse d'un tableau d'objets User
   */
  @Roles('admin', 'employe', 'veterinaire')
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.accountService.getAllUsers();
  }

  /**
   * Crée un nouvel utilisateur avec des données fournies.
   * Accessible uniquement aux administrateurs.
   * @param userData Données de l'utilisateur partiellement remplies
   * @returns La promesse de l'objet User créé
   */
  @Roles('admin')
  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.accountService.createUser(userData, 'admin');
  }

  /**
   * Met à jour les informations d'un utilisateur existant.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'utilisateur à mettre à jour
   * @param userData Nouvelles données de l'utilisateur partiellement remplies
   * @returns La promesse de l'objet User mis à jour
   */
  @Roles('admin')
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.accountService.updateUser(id, userData, 'admin');
  }

  /**
   * Supprime un utilisateur spécifique.
   * Accessible uniquement aux administrateurs.
   * @param id Identifiant de l'utilisateur à supprimer
   * @returns Un message de confirmation de suppression
   */
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
    return this.accountService.deleteUser(id, 'admin');
  }

  // Gestion des rôles

  /**
   * Récupère tous les rôles existants.
   * @returns Une promesse d'un tableau d'objets Role
   */
  @Get('roles')
  async getAllRoles(): Promise<Role[]> {
    return this.accountService.getAllRoles();
  }
}
