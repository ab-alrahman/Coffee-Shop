import {SetMetadata} from '@nestjs/common'
import { UserType } from '../../utils/enum'

// Roles Method 
export const Roles = (...roles: UserType[]) => SetMetadata('roles' , roles)