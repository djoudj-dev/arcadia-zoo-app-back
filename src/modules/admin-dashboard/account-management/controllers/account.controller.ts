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

@Controller('admin/account-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // Gestion des utilisateurs
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.accountService.getAllUsers();
  }

  @Roles('admin')
  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.accountService.createUser(userData, 'admin');
  }

  @Roles('admin')
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.accountService.updateUser(id, userData, 'admin');
  }

  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
    return this.accountService.deleteUser(id, 'admin');
  }

  // Gestion des rôles
  @Get('roles')
  async getAllRoles(): Promise<Role[]> {
    return this.accountService.getAllRoles();
  }
}
