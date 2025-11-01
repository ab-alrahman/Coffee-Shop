import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayloadType } from '../types/type';
import { Reflector } from '@nestjs/core';
import { Role } from '../types/enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflactor: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles: Role[] = this.reflactor.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return false;

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (token && type === 'Bearer') {
      try {
        const payload: JwtPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.config.get<string>('JWT_SECRET'),
          },
        );
        const user = await this.userService.findOneUser(payload.id);
        if (!user) return false;
        if (roles.includes(user.user.role)) {
          request['user'] = payload;
          return true;
        }
      } catch (error) {
        throw new UnauthorizedException('access denied , invalid token');
      }
    } else {
      return false;
    }
    return true;
  }
}
