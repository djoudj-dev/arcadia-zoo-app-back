// AccountController.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/admin-dashboard/account-management/models/user.model';
import { Role } from 'src/modules/admin-dashboard/account-management/models/role.model';

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
