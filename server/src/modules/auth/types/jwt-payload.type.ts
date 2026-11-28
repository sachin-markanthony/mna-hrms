import { AppRole } from '../../../core/decorators/roles.decorator.js';

export interface JwtPayload {
  sub: string;
  email: string;
  employeeId: string;
  role: AppRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  employeeId: string;
  name: string;
  role: AppRole;
  roleId?: string;
  permissions: string[];
  isOffboardedGraceAccess?: boolean;
}
