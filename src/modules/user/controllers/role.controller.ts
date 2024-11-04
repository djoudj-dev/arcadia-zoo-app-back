import { Controller, Get, Param } from '@nestjs/common';
import { RoleService } from '../services/role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll() {
    return await this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.roleService.findOne(id);
  }
}
