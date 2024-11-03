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
import { UserService } from './user.service';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Roles('admin')
  @Post()
  async create(@Body() userData: any) {
    return await this.userService.create(userData, 'admin');
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() userData: any) {
    return await this.userService.update(id, userData, 'admin');
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id, 'admin');
  }
}
