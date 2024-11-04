import { Controller, Get } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { Role } from '../models/role.model';

@Controller('admin/account-management/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }
}
