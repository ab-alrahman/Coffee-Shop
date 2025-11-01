import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../types/type';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const paylaod: JwtPayloadType = request['user'];
    return paylaod;
  },
);
