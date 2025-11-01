import { SetMetadata } from '@nestjs/common';
import { Role } from '../types/enum';

// Roles Method
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
