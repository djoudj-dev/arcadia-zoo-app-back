import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RoleService } from '../user/role.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Post()
  async create(@Body() userData: any, @Req() req: any) {
    const role = req.user?.role || 'guest'; // supposons que le rôle est récupéré de req.user
    return await this.userService.create(userData, role);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() userData: any,
    @Req() req: any,
  ) {
    const role = req.user?.role || 'guest';
    return await this.userService.update(id, userData, role);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: any) {
    const role = req.user?.role || 'guest';
    return await this.userService.delete(id, role);
  }
}
