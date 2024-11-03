import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from 'src/modules/user/role.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('Required Roles:', requiredRoles); // Ajoutez ce log

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('User Roles:', user.role); // Ajoutez ce log

    const hasRole = requiredRoles.some((role) =>
      user.role?.toLowerCase().includes(role.toString().toLowerCase()),
    );
    console.log('Has Role:', hasRole); // Ajoutez ce log

    return hasRole;
  }
}
