import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { User } from 'src/modules/user/models/user.model';

@Controller('admin/account-management')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.accountService.getAllUsers();
  }

  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.accountService.createUser(userData);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.accountService.updateUser(id, userData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
    return this.accountService.deleteUser(id);
  }
}
