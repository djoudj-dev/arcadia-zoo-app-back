import { Role } from './role.model';

export class User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  roleId: number;
}
